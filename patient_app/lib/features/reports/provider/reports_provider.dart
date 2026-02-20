import 'dart:io';
import 'package:flutter/material.dart';

import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/reports/services/reports_service.dart';
import 'package:patient_app/models/report_model.dart';
import 'package:provider/provider.dart';

class ReportProvider with ChangeNotifier {
  final ReportService _service = ReportService();

  bool loading = false;
  List<ReportModel> reports = [];

  String? snackMessage;
  bool isError = false;

  Future<void> fetchReports(BuildContext context) async {
    final token = context.read<AuthProvider>().token;
    if (token == null) return;

    loading = true;
    notifyListeners();

    try {
      final data = await _service.fetchMyReports(token);
      reports = data.map((e) => ReportModel.fromJson(e)).toList();
      print("Fetched reports: ${reports.length}");
    } catch (e) {
      //snackMessage = "Failed to load reports";
      //isError = true;
      print("Error fetching reports: $e");
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> upload({
    required BuildContext context,
    required String title,
    required String type,
    required File file,
  }) async {
    final token = context.read<AuthProvider>().token;
    if (token == null) return;

    loading = true;
    notifyListeners();

    try {
      await _service.uploadReport(
        token: token,
        title: title,
        type: type,
        file: file,
      );

      snackMessage = "Report uploaded successfully";
      isError = false;

      final data = await _service.fetchMyReports(token);
      reports = data.map((e) => ReportModel.fromJson(e)).toList();
    } catch (e) {
      snackMessage = "Report upload failed $e";
      isError = true;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void clearSnack() {
    snackMessage = null;
    isError = false;
  }
}
