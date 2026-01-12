import { Parser } from 'json2csv';

export function generateTasksCsv(tasks: {
  id: number;
  title: string;
  priority: string;
  completedAt?: string;
  createdBy: string;
  assignees: string;
}[]) {
  const fields = [
    { label: 'ID', value: 'id' },
    { label: 'Title', value: 'title' },
    { label: 'Priority', value: 'priority' },
    { label: 'Completed At', value: 'completedAt' },
    { label: 'Created By', value: 'createdBy' },
    { label: 'Assignees', value: 'assignees' },
  ];

  const parser = new Parser({ fields });
  return parser.parse(tasks);
}
