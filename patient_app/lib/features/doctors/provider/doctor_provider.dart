import 'package:flutter/material.dart';
import 'package:patient_app/features/doctors/services/doctor_service.dart';
import 'package:patient_app/models/doctor_model.dart';


class DoctorProvider with ChangeNotifier {
  final DoctorApiService _apiService = DoctorApiService();

  List<DoctorModel> doctors = [];
  bool isLoading = false;

  Future<void> loadDoctors({
    required String hospitalId,
    required String departmentId,
    //required String token,
  }) async {
    isLoading = true;
    notifyListeners();

    try {
      doctors = await _apiService.fetchDoctors(
        hospitalId: hospitalId,
        departmentId: departmentId,
        //token: token,
      );
      print(doctors);
    } catch (e) {
      doctors = [];
    }

    isLoading = false;
    notifyListeners();
  }
}
