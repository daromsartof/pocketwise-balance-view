
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useFinance } from '../../context/FinanceContext';
import { File, FileSpreadsheet, FilePdf, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const ReportExport: React.FC = () => {
  const { toast } = useToast();
  const { dateRange } = useFinance();
  
  const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
    const dateRangeText = `${format(dateRange.startDate, 'yyyy-MM-dd')}_to_${format(dateRange.endDate, 'yyyy-MM-dd')}`;
    
    toast({
      title: `Exporting as ${type.toUpperCase()}`,
      description: `Financial report for ${format(dateRange.startDate, 'MMM d, yyyy')} to ${format(dateRange.endDate, 'MMM d, yyyy')} is being prepared.`,
    });
    
    // In a real implementation, this would generate and download the file
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Your ${type.toUpperCase()} report has been downloaded.`,
      });
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Export Reports
        </CardTitle>
        <CardDescription>
          Download your financial data in various formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          Exporting data for period: {format(dateRange.startDate, 'MMM d, yyyy')} to {format(dateRange.endDate, 'MMM d, yyyy')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <FilePdf className="h-8 w-8 mb-2 text-red-500" />
              <h3 className="font-medium">PDF Report</h3>
              <p className="text-xs text-muted-foreground mb-3">Complete report with charts and AI insights</p>
              <Button variant="default" size="sm" onClick={() => handleExport('pdf')}>
                Export as PDF
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <FileSpreadsheet className="h-8 w-8 mb-2 text-green-600" />
              <h3 className="font-medium">Excel Export</h3>
              <p className="text-xs text-muted-foreground mb-3">Spreadsheet with detailed transaction data</p>
              <Button variant="default" size="sm" onClick={() => handleExport('excel')}>
                Export as Excel
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <File className="h-8 w-8 mb-2 text-blue-500" />
              <h3 className="font-medium">CSV Data</h3>
              <p className="text-xs text-muted-foreground mb-3">Raw data that can be imported to other tools</p>
              <Button variant="default" size="sm" onClick={() => handleExport('csv')}>
                Export as CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start text-xs text-muted-foreground">
        All exports include only the data for the selected date range
      </CardFooter>
    </Card>
  );
};

export default ReportExport;
