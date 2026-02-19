import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthApiService {
  static const String baseUrl = "http://10.69.119.145:3000/api";

  // LOGIN
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse("$baseUrl/auth/user-login"),
      headers: {
        "Content-Type": "application/json",
        //if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({"email": email, "password": password}),
    );

    return jsonDecode(response.body)as Map<String, dynamic>;
  }

  // REGISTER (PATIENT)
  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse("$baseUrl/patients/register"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"name": name, "email": email, "password": password}),
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
