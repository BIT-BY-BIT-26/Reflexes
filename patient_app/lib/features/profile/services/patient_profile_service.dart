import 'dart:convert';
import 'dart:io';
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
    DateTime? dob,
    String? gender,
    String? bloodGroup,
    String? phone,
    File? image,
  }) async {

    final request = http.MultipartRequest(
      "PATCH",
      Uri.parse("$baseUrl/patients/update-patient-profile"),
    );

    request.headers["Authorization"] =
        "Bearer $token";

    if (dob != null) {
      request.fields["dob"] =
          dob.toIso8601String();
    }

    if (gender != null) {
      request.fields["gender"] = gender;
    }

    if (bloodGroup != null) {
      request.fields["bloodGroup"] = bloodGroup;
    }

    if (phone != null) {
      request.fields["phone_number"] = phone;
    }

    if (image != null) {
      request.files.add(
        await http.MultipartFile.fromPath(
          "profileImage",
          image.path,
        ),
      );
    }

    final streamedResponse =
        await request.send();

    final response =
        await http.Response.fromStream(
      streamedResponse,
    );
    print("response of update-${response.statusCode}");
    print(response.body);

    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return PatientModel.fromJson(
        data["patient"],
      );
    }

    throw Exception(
      data["message"] ??
          "Failed to update profile",
    );
  }
}
