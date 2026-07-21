import 'package:flutter/material.dart';
import 'package:patient_app/features/hospitals/review_response.dart';
import 'package:patient_app/features/hospitals/service/review_service.dart';
import 'package:patient_app/models/review_model.dart';

class ReviewProvider extends ChangeNotifier {
  final ReviewService _reviewService = ReviewService();

  HospitalReviewResponse? hospitalReview;

  bool isLoading = false;
  bool isFetching = false;
  bool isSubmitting = false;

  String? error;

  bool get hasReviewed => hospitalReview?.myReview != null;

  ReviewModel? get myReview => hospitalReview?.myReview;

  /// GET REVIEWS

  Future<void> getHospitalReviews({
    required String hospitalId,
    required String token,
  }) async {
    try {
      print("API CALLED FOR => $hospitalId");
      isFetching = true;
      error = null;
      notifyListeners();

      hospitalReview = await _reviewService.getHospitalReviews(
        hospitalId: hospitalId,
        token: token,
      );
      print("Provider myReview = ${hospitalReview?.myReview}");
    } catch (e) {
      error = e.toString();
    } finally {
      isFetching = false;
      notifyListeners();
    }
  }

  /// ADD REVIEW
  Future<bool> addReview({
    required String hospitalId,
    required String token,
    required int rating,
    required String feedback,
  }) async {
    try {
      isSubmitting = true;
      notifyListeners();
      error = null;
      await _reviewService.addReview(
        hospitalId: hospitalId,
        token: token,
        rating: rating,
        feedback: feedback,
      );

      // Refresh Reviews
      await getHospitalReviews(hospitalId: hospitalId,token: token);

      return true;
    } catch (e) {
      isSubmitting = false;
      error = e.toString().replaceFirst("Exception: ", "");
      notifyListeners();
      return false;
    }
  }

  /// EDIT REVIEW

  Future<bool> editReview({
    required String hospitalId,
    required String token,
    required int rating,
    required String feedback,
  }) async {
    try {
      isSubmitting = true;
      notifyListeners();
      error = null;
      await _reviewService.editReview(
        hospitalId: hospitalId,
        token: token,
        rating: rating,
        feedback: feedback,
      );

      // Refresh Reviews
      await getHospitalReviews(hospitalId: hospitalId,token: token);

      return true;
    } catch (e) {
      isSubmitting = false;
      error = e.toString().replaceFirst("Exception: ", "");
      notifyListeners();
      return false;
    }
  }

  void clearReviews() {
  hospitalReview = null;
    error = null;
    isFetching = false;
    isSubmitting = false;
    notifyListeners();
  }

  /// CLEAR ERROR

  void clearError() {
    error = null;
    notifyListeners();
  }
}
