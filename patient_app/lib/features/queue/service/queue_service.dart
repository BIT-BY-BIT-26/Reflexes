import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/queue_model.dart';
import 'package:patient_app/utils/constants.dart';

class QueueService {
  Future<ActiveQueueModel> getActiveQueue(String token) async {
    try {
      final response = await http.get(
        Uri.parse("$baseUrl/patients/active-queue-status"),
        headers: {
          "Authorization": "Bearer $token",
        },
      );

      print("Status Code: ${response.statusCode}");
      print("Response Body: ${response.body}");

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ActiveQueueModel.fromJson(data);
      } else {
        throw Exception(
          "Failed to load queue. Status Code: ${response.statusCode}",
        );
      }
    } catch (e) {
      print("Error in getActiveQueue: $e");
      throw Exception("Something went wrong while fetching queue");
    }
  }
}
