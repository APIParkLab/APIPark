import { useEffect } from "react";
import { editor } from "monaco-editor";
import useInitializeMonaco from "@common/hooks/useInitializeMonaco";
import { Editor, useMonaco } from '@monaco-editor/react'

export type MonacoEditorRefType = editor.IStandaloneCodeEditor;
const MonacoEditorWrapper: React.FC = (props) => {
    useInitializeMonaco();
    const monacoInstance = useMonaco();

    useEffect(() => {
        if (monacoInstance) {
            // 在这里你可以访问并配置Monaco实例
        }
    }, [monacoInstance]);

    return <Editor {...props} />;
};

export default MonacoEditorWrapper;