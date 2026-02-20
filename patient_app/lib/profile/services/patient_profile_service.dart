import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:meditrack_patient_app/models/patient_model.dart';

class PatientService {
  static const String baseUrl =
      "http://10.69.119.145:3000/api/patients";

  Future<PatientModel> getMyProfile(String token) async {
    final response = await http.get(
      Uri.parse("$baseUrl/me"),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );
    

    final data = jsonDecode(response.body);
    print("Profile Response: ${response.statusCode} - ${response.body}");

    if (response.statusCode == 200) {
      return PatientModel.fromJson(data['patient']);
    } else {
      throw Exception(data['message'] ?? "Failed to fetch profile");
    }
  }
}
