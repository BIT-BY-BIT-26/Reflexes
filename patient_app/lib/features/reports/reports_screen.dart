import 'package:flutter/material.dart';
import 'package:patient_app/features/reports/provider/reports_provider.dart';
import 'package:patient_app/features/reports/upload_report_sheet.dart';
import 'package:patient_app/features/viewer_screens/image_viewer.dart';
import 'package:patient_app/features/viewer_screens/pdf_viewer.dart';
import 'package:patient_app/helpers/reports_icon_helper.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class MyReportsScreen extends StatefulWidget {
  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<ReportProvider>().fetchReports(context);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("My Reports")),
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.add),
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            builder: (_) => UploadReportSheet(),
          );
        },
      ),
      body: Consumer<ReportProvider>(
        builder: (_, provider, __) {
          // 🔥 SnackBar trigger
          if (provider.snackMessage != null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(provider.snackMessage!),
                  backgroundColor:
                      provider.isError ? Colors.red : Colors.green,
                ),
              );
              provider.clearSnack();
            });
          }
    
    
          if (provider.loading) {
            return Center(child: CircularProgressIndicator());
          }
    
          if (provider.reports.isEmpty) {
            return Center(child: Text("No reports uploaded"));
          }
    
          return GridView.builder(
            padding: const EdgeInsets.all(12),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: provider.reports.length,
            itemBuilder: (_, index) {
              final report = provider.reports[index];
    
              return GestureDetector(
                onTap: () {
                  debugPrint("REPORT URL => ${report.file}");
                  if (report.fileType == "image") {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ImageViewerScreen(imageUrl: report.file),
                      ),
                    );
                  } else {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PdfViewerScreen(pdfUrl: report.file),
                      ),
                    );
                  }
                },
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        getReportIcon(report.type),
                        size: 42,
                        color: Colors.blueGrey,
                      ),
                      const SizedBox(height: 8),
                      Text(report.title,
                          maxLines: 2, overflow: TextOverflow.ellipsis),
                      Text(report.type,
                          style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}


Future<void> _openPdf(BuildContext context, String url) async {
  final uri = Uri.parse(url);

  await launchUrl(
    uri,
    mode: LaunchMode.externalApplication,
  );
}


Future<void> _openImage(BuildContext context, String url) async {
  final uri = Uri.parse(url);

  await launchUrl(
    uri,
    mode: LaunchMode.externalApplication,
  );
}





