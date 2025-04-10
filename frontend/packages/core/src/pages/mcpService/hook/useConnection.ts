import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  SSEClientTransport,
  SseError,
} from "@modelcontextprotocol/sdk/client/sse.js";
import { App } from 'antd'
import {
  ClientNotification,
  ClientRequest,
  CreateMessageRequestSchema,
  ListRootsRequestSchema,
  ProgressNotificationSchema,
  ResourceUpdatedNotificationSchema,
  LoggingMessageNotificationSchema,
  Request,
  Result,
  ServerCapabilities,
  PromptReference,
  ResourceReference,
  McpError,
  CompleteResultSchema,
  ErrorCode,
  CancelledNotificationSchema,
  ResourceListChangedNotificationSchema,
  ToolListChangedNotificationSchema,
  PromptListChangedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { useState } from "react";
import { z } from "zod";
import { ConnectionStatus, SESSION_KEYS } from "./constants";
import { Notification, StdErrNotificationSchema } from "./notificationTypes";
// import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
// import { authProvider } from "../auth";
// import packageJson from "../../../package.json";


interface UseConnectionOptions {
  transportType: "stdio" | "sse";
  command?: string;
  args?: string;
  sseUrl: string;
  env?: Record<string, string>;
  proxyServerUrl: string;
  bearerToken?: string;
  requestTimeout?: number;
  onNotification?: (notification: Notification) => void;
  onStdErrNotification?: (notification: Notification) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPendingRequest?: (request: any, resolve: any, reject: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRoots?: () => any[];
}

interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  suppressToast?: boolean;
}

export function useConnection({
  transportType,
  command,
  args,
  sseUrl,
  env,
  proxyServerUrl,
  bearerToken,
  requestTimeout,
  onNotification,
  onStdErrNotification,
  onPendingRequest,
  getRoots,
}: UseConnectionOptions) {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const { message } = App.useApp()
  const [serverCapabilities, setServerCapabilities] =
    useState<ServerCapabilities | null>(null);
  const [mcpClient, setMcpClient] = useState<Client | null>(null);
  const [requestHistory, setRequestHistory] = useState<
    { request: string; response?: string }[]
  >([]);
  const [completionsSupported, setCompletionsSupported] = useState(true);

  const pushHistory = (request: object, response?: object) => {
    setRequestHistory((prev) => [
      ...prev,
      {
        request: JSON.stringify(request),
        response: response !== undefined ? JSON.stringify(response) : undefined,
      },
    ]);
  };

  const makeRequest = async <T extends z.ZodType>(
    request: ClientRequest,
    schema: T,
    options?: RequestOptions,
  ): Promise<z.output<T>> => {
    if (!mcpClient) {
      throw new Error("MCP client not connected");
    }

    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort("Request timed out");
      }, options?.timeout ?? requestTimeout);

      let response;
      try {
        response = await mcpClient.request(request, schema, {
          signal: options?.signal ?? abortController.signal,
        });
        pushHistory(request, response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        pushHistory(request, { error: errorMessage });
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }

      return response;
    } catch (e: unknown) {
      if (!options?.suppressToast) {
        const errorString = (e as Error).message ?? String(e);
        message.error(errorString)
      }
      throw e;
    }
  };

  const handleCompletion = async (
    ref: ResourceReference | PromptReference,
    argName: string,
    value: string,
    signal?: AbortSignal,
  ): Promise<string[]> => {
    if (!mcpClient || !completionsSupported) {
      return [];
    }

    const request: ClientRequest = {
      method: "completion/complete",
      params: {
        argument: {
          name: argName,
          value,
        },
        ref,
      },
    };

    try {
      const response = await makeRequest(request, CompleteResultSchema, {
        signal,
        suppressToast: true,
      });
      return response?.completion.values || [];
    } catch (e: unknown) {
      // Disable completions silently if the server doesn't support them.
      // See https://github.com/modelcontextprotocol/specification/discussions/122
      if (e instanceof McpError && e.code === ErrorCode.MethodNotFound) {
        setCompletionsSupported(false);
        return [];
      }

      // Unexpected errors - show toast and rethrow
      message.error(e instanceof Error ? e.message : String(e))
      throw e;
    }
  };

  const sendNotification = async (notification: ClientNotification) => {
    if (!mcpClient) {
      const error = new Error("MCP client not connected");
      message.error(error.message)
      throw error;
    }

    try {
      await mcpClient.notification(notification);
      // Log successful notifications
      pushHistory(notification);
    } catch (e: unknown) {
      if (e instanceof McpError) {
        // Log MCP protocol errors
        pushHistory(notification, { error: e.message });
      }
      message.error(e instanceof Error ? e.message : String(e))
      throw e;
    }
  };
  // TODO_先屏蔽，暂时不需要
  // const checkProxyHealth = async () => {
  //   try {
  //     const proxyHealthUrl = new URL(`${proxyServerUrl}/health`);
  //     const proxyHealthResponse = await fetch(proxyHealthUrl);
  //     const proxyHealth = await proxyHealthResponse.json();
  //     if (proxyHealth?.status !== "ok") {
  //       throw new Error("MCP Proxy Server is not healthy");
  //     }
  //   } catch (e) {
  //     console.error("Couldn't connect to MCP Proxy Server", e);
  //     throw e;
  //   }
  // };
// TODO_先屏蔽，暂时不需要
//   const handleAuthError = async (error: unknown) => {
//     if (error instanceof SseError && error.code === 401) {
//       sessionStorage.setItem(SESSION_KEYS.SERVER_URL, sseUrl);

//       const result = await auth(authProvider, { serverUrl: sseUrl });
//       return result === "AUTHORIZED";
//     }

//     return false;
//   };

  const connect = async (_e?: unknown, retryCount: number = 0) => {
    const client = new Client<Request, Notification, Result>(
      {
        name: "mcp-inspector",
        version: '0.0.1',
      },
      {
        capabilities: {
          sampling: {},
          roots: {
            listChanged: true,
          },
        },
      },
    );
    // TODO_暂时不需要
    // try {
    //   await checkProxyHealth();
    // } catch {
    //   setConnectionStatus("error-connecting-to-proxy");
    //   return;
    // }
    // 使用与http.ts一致的方式处理URL
    // 注意：proxyServerUrl应该是完整URL，或者我们需要为其添加基础URL
    // 处理两种情况：完整URL或相对路径
    let fullUrl;
    if (proxyServerUrl.startsWith('http://') || proxyServerUrl.startsWith('https://')) {
      // 如果是完整URL，直接使用
      fullUrl = `${proxyServerUrl}/sse`;
    } else {
      // 如果是相对路径，添加基础URL和API前缀
      const baseUrl = window.location.origin;
      const apiPrefix = '/api/v1/';
      fullUrl = `${baseUrl}${apiPrefix}${proxyServerUrl}`;
    }
    const mcpProxyServerUrl = new URL(fullUrl);
    mcpProxyServerUrl.searchParams.append("transportType", transportType);
    if (transportType === "stdio") {
      mcpProxyServerUrl.searchParams.append("command", command || '');
      mcpProxyServerUrl.searchParams.append("args", args || '');
      mcpProxyServerUrl.searchParams.append("env", JSON.stringify(env || {}));
    } else {
      mcpProxyServerUrl.searchParams.append("url", sseUrl);
    }
    console.log('sseUrl===', sseUrl)
    try {
      // Inject auth manually instead of using SSEClientTransport, because we're
      // proxying through the inspector server first.
      const headers: HeadersInit = {};

      // TODO_暂时不需要。Use manually provided bearer token if available, otherwise use OAuth tokens
      // const token = bearerToken || (await authProvider.tokens())?.access_token;
      // if (token) {
      //   headers["Authorization"] = `Bearer ${token}`;
      // }

      // 创建SSE客户端传输层
      const clientTransport = new SSEClientTransport(mcpProxyServerUrl, {
        eventSourceInit: {
          fetch: (url, init) => fetch(url, { ...init, headers }),
        },
        requestInit: {
          headers,
        },
      });
      // TODO_暂时不需要
      // if (onNotification) {
      //   [
      //     CancelledNotificationSchema,
      //     ProgressNotificationSchema,
      //     LoggingMessageNotificationSchema,
      //     ResourceUpdatedNotificationSchema,
      //     ResourceListChangedNotificationSchema,
      //     ToolListChangedNotificationSchema,
      //     PromptListChangedNotificationSchema,
      //   ].forEach((notificationSchema) => {
      //     client.setNotificationHandler(notificationSchema, onNotification);
      //   });

      //   client.fallbackNotificationHandler = (
      //     notification: Notification,
      //   ): Promise<void> => {
      //     onNotification(notification);
      //     return Promise.resolve();
      //   };
      // }

      // if (onStdErrNotification) {
      //   client.setNotificationHandler(
      //     StdErrNotificationSchema,
      //     onStdErrNotification,
      //   );
      // }

      try {
        await client.connect(clientTransport);
      } catch (error) {
        console.error(
          `Failed to connect to MCP Server via the MCP Inspector Proxy: ${mcpProxyServerUrl}:`,
          error,
        );
        // TODO_先屏蔽，后续如果需要再处理
        // const shouldRetry = await handleAuthError(error);
        // if (shouldRetry) {
        //   return connect(undefined, retryCount + 1);
        // }

        if (error instanceof SseError && error.code === 401) {
          // Don't set error state if we're about to redirect for auth
          return;
        }
        throw error;
      }

      const capabilities = client.getServerCapabilities();
      setServerCapabilities(capabilities ?? null);
      setCompletionsSupported(true); // Reset completions support on new connection
      // TODO_暂时不需要
      // if (onPendingRequest) {
      //   client.setRequestHandler(CreateMessageRequestSchema, (request) => {
      //     return new Promise((resolve, reject) => {
      //       onPendingRequest(request, resolve, reject);
      //     });
      //   });
      // }

      // if (getRoots) {
      //   client.setRequestHandler(ListRootsRequestSchema, async () => {
      //     return { roots: getRoots() };
      //   });
      // }

      setMcpClient(client);
      setConnectionStatus("connected");
    } catch (e) {
      console.error(e);
      setConnectionStatus("error");
    }
  };

  const disconnect = async () => {
    await mcpClient?.close();
    setMcpClient(null);
    setConnectionStatus("disconnected");
    setCompletionsSupported(false);
    setServerCapabilities(null);
  };

  return {
    connectionStatus,
    serverCapabilities,
    mcpClient,
    requestHistory,
    makeRequest,
    sendNotification,
    handleCompletion,
    completionsSupported,
    connect,
    disconnect,
  };
}
