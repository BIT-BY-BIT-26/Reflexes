import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/appointment_model.dart';
import 'package:patient_app/utils/constants.dart';

class AppointmentService {

  static Future<Map<String, dynamic>> createAppointment({
    required String doctorId,
    required DateTime date,
    required String token,
    required String appointmentType,
    String? reason,
    String? description,
  }) async {
    try {
      final body = <String, dynamic>{
        "doctor": doctorId,
        "date": date.toIso8601String(),
        "appointmentType": appointmentType,
      };
      if (reason != null && reason.trim().isNotEmpty) {
        body['reason'] = reason.trim();
      }
      if (description != null && description.trim().isNotEmpty) {
        body['description'] = description.trim();
      }

      final res = await http.post(
        Uri.parse("$baseUrl/appointments"),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: jsonEncode(body),
      );

      final decoded = res.body.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(res.body) as Map<String, dynamic>;

      if (res.statusCode == 200 || res.statusCode == 201) {
        return decoded;
      }

      return {
        "success": false,
        "message": decoded["message"] ?? "Booking failed",
      };
    } catch (e) {
      return {
        "success": false,
        "message": "Unable to connect to the server. Please try again."
      };
    }
  }

  static Future<List<AppointmentModel>> getMyAppointments(String token) async {
    try {
      final res = await http.get(
        Uri.parse("$baseUrl/appointments/my/patients"),
        headers: {
          "Authorization": "Bearer $token",
        },
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        print("APPOINTMENTS DATA: $data");

        return (data['appointments'] as List)
            .map((e) => AppointmentModel.fromJson(e))
            .toList();
      } else {
        throw Exception(
          jsonDecode(res.body)['message'] ?? "Failed to load appointments",
        );
      }
    } catch (e) {
      throw Exception("Network error: ${e.toString()}");
    }
  }
}
