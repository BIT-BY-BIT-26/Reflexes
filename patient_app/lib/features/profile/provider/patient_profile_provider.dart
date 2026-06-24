import 'dart:io';

import 'package:flutter/material.dart';
import 'package:patient_app/models/patient_model.dart';
import 'package:patient_app/features/profile/services/patient_profile_service.dart';


class PatientProvider extends ChangeNotifier {
  final PatientService service = PatientService();

  PatientModel? patient;
  bool loading = false;
  String? error;

  Future<void> fetchProfile(String token) async {
    loading = true;
    error = null;
    notifyListeners();

    try {
      patient = await service.getMyProfile(token);
    } catch (e) {
      error = e.toString();
    }

    loading = false;
    notifyListeners();
  }
  
  Future<void> updateProfile({
    required String token,
    DateTime? dob,
    String? gender,
    String? bloodGroup,
    String? phone,
    File? image,
  }) async {
    try {
      loading = true;
      notifyListeners();

      patient = await service.updateProfile(
        token: token,
        dob: dob,
        gender: gender,
        bloodGroup: bloodGroup,
        phone: phone,
        image: image,
      );

      loading = false;
      notifyListeners();

    } catch (e) {
      loading = false;
      error = e.toString();
      notifyListeners();
    }
  }
}
