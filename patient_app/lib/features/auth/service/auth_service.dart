import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/utils/constants.dart';

class AuthApiService {

  // LOGIN
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse("$baseUrl/auth/login"),
      headers: {
        "Content-Type": "application/json",
        //if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({"email": email, "password": password}),
    );
    print("Login response: ${response.body}");
    return jsonDecode(response.body)as Map<String, dynamic>;
  }

  // REGISTER (PATIENT)
  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String gender,
    required DateTime dob,
    required String bloodGroup,
    required String phone,
  }) async {
    final response = await http.post(
      Uri.parse("$baseUrl/patients/register"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "name": name, 
        "email": email, 
        "password": password,
        "gender": gender,
        "dob": dob.toIso8601String(),
        "bloodGroup": bloodGroup,
        "phone_number":phone
        }),
    );
    return jsonDecode(response.body)as Map<String, dynamic>;
  }

  //GET USER PROFILE
  static Future<Map<String, dynamic>> getProfile(String token) async {
    final response = await http.get(
      Uri.parse("$baseUrl/auth/me"),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );
    return jsonDecode(response.body);
  }

}
