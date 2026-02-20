import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:patient_app/features/reports/provider/reports_provider.dart';
import 'package:provider/provider.dart';

class UploadReportSheet extends StatefulWidget {
  @override
  State<UploadReportSheet> createState() => _UploadReportSheetState();
}

class _UploadReportSheetState extends State<UploadReportSheet> {
  final titleCtrl = TextEditingController();
  String selectedType = "LAB";
  File? selectedFile;

  final types = ["LAB", "MRI", "XRAY", "OTHER"];

  pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'png'],
    );

    if (result != null) {
      setState(() {
        selectedFile = File(result.files.single.path!);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.read<ReportProvider>();

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 16, right: 16, top: 20
      ),
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.35,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text("Upload Report", style: TextStyle(fontSize: 18,fontWeight: FontWeight.bold)),
        
            TextField(
              controller: titleCtrl,
              decoration: InputDecoration(labelText: "Title"),
            ),
        
            DropdownButtonFormField(
              value: selectedType,
              items: types.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (val) => setState(() => selectedType = val!),
              decoration: InputDecoration(labelText: "Report Type"),
            ),
        
            const SizedBox(height: 10),
        
            ElevatedButton.icon(
              onPressed: pickFile,
              icon: Icon(Icons.attach_file),
              label: Text(selectedFile == null ? "Attach File" : "File Selected"),
            ),
        
            const SizedBox(height: 16),
        
            ElevatedButton(
              onPressed: selectedFile == null
                  ? null
                  : () async {
                      await provider.upload(
                        title: titleCtrl.text,
                        type: selectedType,
                        file: selectedFile!,
                        context: context
                      );
                      Navigator.pop(context);
                    },
              child: Text("Upload"),
            )
          ],
        ),
      ),
    );
  }
}
