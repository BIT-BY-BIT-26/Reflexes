import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/appointment_model.dart';
import 'package:patient_app/utils/constants.dart';

class AppointmentService {

  static Future<Map<String, dynamic>> createAppointment({
    required String doctorId,
    required String date,
    required String token,
    required String appointmentType,

  }) async {
    try {
      final res = await http.post(
        Uri.parse("$baseUrl/appointments"),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: jsonEncode({
          "doctor": doctorId,
          "date": date,
          "appointmentType": appointmentType,
        }),
      );

      print("STATUS CODE: ${res.statusCode}");
      print("BODY: ${res.body}");

      if (res.statusCode == 200 || res.statusCode == 201) {
        return jsonDecode(res.body);
      } else {
        return {
          "success": false,
          "message": jsonDecode(res.body)["message"] ?? "Booking failed"
        };
      }
    } catch (e) {
      return {
        "success": false,
        "message": "Network error"
      };
    }
  }

  static Future<List<AppointmentModel>> getMyAppointments(String token) async {
    try {
      final res = await http.get(
        Uri.parse("$baseUrl/appointments/my"),
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
