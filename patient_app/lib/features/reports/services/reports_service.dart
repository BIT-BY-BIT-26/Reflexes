import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:patient_app/utils/constants.dart';

class ReportService {

  Future<void> uploadReport({
    required String token,
    required String title,
    required String type,
    required File file,
  }) async {
    final uri = Uri.parse("$baseUrl/reports/upload-report");

    final request = http.MultipartRequest("POST", uri);
    request.headers['Authorization'] = "Bearer $token";

    request.fields['title'] = title;
    request.fields['type'] = type;

    request.files.add(
      await http.MultipartFile.fromPath('file', file.path),
    );

    final response = await request.send();

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception("Report upload failed");
    }
  }

  Future<List<dynamic>> fetchMyReports(String token) async {
    final res = await http.get(
      Uri.parse("$baseUrl/patients/get-my-reports"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );
    print("Fetch Reports Response: ${res.statusCode} - ${res.body}");
    if (res.statusCode != 200) {
      throw Exception("Failed to fetch reports");
    }
    
    return jsonDecode(res.body)['reports'];
  }
}
