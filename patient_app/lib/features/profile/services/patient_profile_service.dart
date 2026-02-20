import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/patient_model.dart';
import 'package:patient_app/utils/constants.dart';

class PatientService {

  Future<PatientModel> getMyProfile(String token) async {
    final response = await http.get(
      Uri.parse("$baseUrl/patients/me"),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );
    print("Profile Response: ${response.statusCode} - ${response.body}");
    

    final data = jsonDecode(response.body);
    print("Profile Response: ${response.statusCode} - ${response.body}");

    if (response.statusCode == 200) {
      return PatientModel.fromJson(data['patient']);
    } else {
      throw Exception(data['message'] ?? "Failed to fetch profile");
    }
  }

  Future<PatientModel> updateProfile({
    required String token,
    String? age,
    String? gender,
    String? bloodGroup,
    String? phone,
  }) async {
    final response = await http.put(
      Uri.parse("$baseUrl/patient/update-profile"),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token"
      },
      body: jsonEncode({
        "age": age,
        "gender": gender,
        "bloodGroup": bloodGroup,
        "phone_number": phone,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return PatientModel.fromJson(data["patient"]);
    } else {
      throw Exception(data["message"] ?? "Failed to update profile");
    }
  }
}
