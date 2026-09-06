import 'package:flutter/foundation.dart';
import 'package:patient_app/features/pharmacy/pharmacy_service.dart';
import 'package:patient_app/models/pharmacy_model.dart';



class PharmacyProvider extends ChangeNotifier {
  final PharmacyService _service = PharmacyService();

  List<Pharmacy> _pharmacies = [];

  bool _isLoading = false;
  String? _error;

  List<Pharmacy> get pharmacies => _pharmacies;

  bool get isLoading => _isLoading;

  String? get error => _error;

  Future<void> fetchPharmacies() async {
    _isLoading = true;
    _error = null;

    notifyListeners();

    try {
      _pharmacies =
          await _service.getAvailablePharmacies();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;

    notifyListeners();
  }

  Future<void> refresh() async {
    await fetchPharmacies();
  }
}