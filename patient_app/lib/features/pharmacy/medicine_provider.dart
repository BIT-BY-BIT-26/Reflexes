import 'package:flutter/material.dart';
import 'package:patient_app/features/pharmacy/medicine_service.dart';
import 'package:patient_app/models/medicine_model.dart';

class MedicineProvider extends ChangeNotifier {
  final MedicineService _service =
      MedicineService();

  List<Medicine> _medicines = [];

  bool _isLoading = false;
  String? _error;

  List<Medicine> get medicines => _medicines;

  bool get isLoading => _isLoading;

  String? get error => _error;

  Future<void> fetchMedicines(
    String pharmacyId,
  ) async {
    _isLoading = true;
    _error = null;

    notifyListeners();

    try {
      _medicines =
          await _service.getMedicinesByPharmacy(
        pharmacyId,
      );
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;

    notifyListeners();
  }

  void clearMedicines() {
    _medicines = [];
    _error = null;
    notifyListeners();
  }
}