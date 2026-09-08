import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/emergency_model.dart';
import 'package:patient_app/utils/constants.dart';

class EmergencyService {
  final String token;

  EmergencyService({
    required this.token,
  });

  Future<EmergencyModel> createEmergency({
    required double latitude,
    required double longitude,
    required String reason,
    String message = '',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/emergency'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'location': {
          'type': 'Point',
          'coordinates': [
            longitude,
            latitude,
          ],
        },
        'reason': reason,
        'message': message,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode >= 200 &&
        response.statusCode < 300) {
      
      return EmergencyModel.fromJson(
        data['emergency'] ?? data['data'] ?? data,
      );
    }

    throw Exception(
      data['message'] ?? 'Failed to create emergency',
    );
  }


  // Get currently active emergency
  Future<EmergencyModel?> getActiveEmergency() async {
    final response = await http.get(
      Uri.parse('$baseUrl/emergency/active'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 404) {
      return null;
    }

    final data = jsonDecode(response.body);

    if (response.statusCode >= 200 &&
        response.statusCode < 300) {
      
      final emergency =
          data['emergency'] ?? data['data'];

      if (emergency == null) {
        return null;
      }

      return EmergencyModel.fromJson(
        Map<String, dynamic>.from(emergency),
      );
    }

    throw Exception(
      data['message'] ?? 'Failed to fetch emergency',
    );
  }
  

  // Cancel emergency
  Future<EmergencyModel> cancelEmergency(
    String emergencyId,
  ) async {
    final response = await http.patch(
      Uri.parse(
        '$baseUrl/emergency/$emergencyId/cancel',
      ),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final data = jsonDecode(response.body);

    if (response.statusCode >= 200 &&
        response.statusCode < 300) {
      
      return EmergencyModel.fromJson(
        data['emergency'] ?? data['data'] ?? data,
      );
    }

    throw Exception(
      data['message'] ?? 'Failed to cancel emergency',
    );
  }
}