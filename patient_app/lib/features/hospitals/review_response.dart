import 'package:patient_app/models/hospital_model.dart';
import 'package:patient_app/models/review_model.dart';

class HospitalReviewResponse {
  final Hospital hospital;
  final Map<String, dynamic> ratingDistribution;
  final List<ReviewModel>? reviews;
  final ReviewModel? myReview;

  HospitalReviewResponse({
    required this.myReview,
    required this.hospital,
    required this.ratingDistribution,
    required this.reviews,
  });

  factory HospitalReviewResponse.fromJson(Map<String, dynamic> json) {
    return HospitalReviewResponse(
      hospital: Hospital.fromJson(json["hospital"]),

      ratingDistribution: Map<String, dynamic>.from(
        json["ratingDistribution"] ?? {},
      ),
      myReview: json["myReview"] != null
      ? ReviewModel.fromJson(json["myReview"])
      : null,

      reviews: (json["reviews"] as List<dynamic>? ?? [])
          .map((e) => ReviewModel.fromJson(e))
          .toList(),
    );
  }
}