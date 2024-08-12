
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ProColumnType } from '@ant-design/pro-components';

export const useExcelExport = <T>() => {

  const createExcel = (sheetTitle: string, columns: ExcelJS.Column[], tableData: T[]) => {
    const workBook = new ExcelJS.Workbook()
    const sheet = workBook.addWorksheet(sheetTitle || '默认工作表');
    sheet.columns = columns;
    sheet.addRows(tableData);
    return workBook
  };

  const exportExcel = async (fileTitle: string, date: [number, number], sheetTitle: string, tableId: string, tableColumnConfig: (ProColumnType<T>&{eoTitle:string})[], tableData: T[]) => {
    const workBook = createExcel(sheetTitle, getColumns(tableId, tableColumnConfig) as ExcelJS.Column[], tableData || [])
    const fileName = getFileName(fileTitle, date);
    try {
      const buffer = await workBook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], {
        type: 'application/octet-stream'
      }), `${fileName}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel file:', error);
    }
  };

  const getColumns = (tableId: string, tableColumnConfig: (ProColumnType<T>&{eoTitle:string})[]) => {
    let tableConfig: Record<string, { show: boolean }> | null;
    try {
      const storedConfig = localStorage.getItem(tableId);
      tableConfig = storedConfig ? JSON.parse(storedConfig) : {};
    } catch (error) {
      console.error('Error parsing localStorage config:', error);
      tableConfig = {};
    }
    return tableColumnConfig
      .filter((head: ProColumnType<T>&{eoTitle:string}) => tableConfig?.[head.dataIndex as string]?.show)
      .map((head) => { return({
        header: head.eoTitle,
        key: head.dataIndex,
        width: (head.eoTitle as string).length > 5 ? (head.eoTitle as string).length * 3 : 15,
        style: (head.dataIndex as string).includes('Rate') ? { numFmt: '0.00%' } : undefined,
      })});
  };

  const getFileName = (fileTitle: string, date: [number, number]): string => {
    const [start, end] = date.map((time) => getDateFormat(time));
    return `${fileTitle}-${start}至${end}`;
  };

  const getDateFormat = (time: number): string => {
    const date = new Date(time * 1000);
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return { exportExcel };
};
