import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/features/hospitals/review_response.dart';
import 'package:patient_app/models/hospital_model.dart';
import '../../../utils/constants.dart';

class ReviewService {
  
  ///GET REVIEWS
  Future<HospitalReviewResponse> getHospitalReviews({
    required String hospitalId,
    required String token,
  }) async {
    final response = await http.get(
      Uri.parse("$baseUrl/hospital/$hospitalId/review"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return HospitalReviewResponse.fromJson(data);
    }

    throw Exception(data["message"]);
  }

  /// ADD REVIEW
  Future<void> addReview({
    required String hospitalId,
    required String token,
    required int rating,
    required String feedback,
  }) async {
    final response = await http.post(
      Uri.parse(
          "$baseUrl/hospital/$hospitalId/review"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "rating": rating,
        "feedback": feedback,
      }),
    );

    if (response.statusCode != 201) {
      throw Exception(jsonDecode(response.body)["message"]);
    }
  }

  /// EDIT REVIEW
  Future<void> editReview({
    required String hospitalId,
    required String token,
    required int rating,
    required String feedback,
  }) async {
    final response = await http.put(
      Uri.parse(
          "$baseUrl/hospital/$hospitalId/review"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "rating": rating,
        "feedback": feedback,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception(jsonDecode(response.body)["message"]);
    }
  }
}