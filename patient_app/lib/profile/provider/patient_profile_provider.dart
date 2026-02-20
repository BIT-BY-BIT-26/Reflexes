import 'package:flutter/material.dart';
import 'package:meditrack_patient_app/features/profile/services/patient_profile_service.dart';
import 'package:meditrack_patient_app/models/patient_model.dart';


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
}
