import 'package:flutter/material.dart';
import 'package:patient_app/features/pharmacy/service/pharmacy_service.dart';
import 'package:patient_app/helpers/location_helper.dart';
import 'package:patient_app/models/medicine_model.dart';
import 'package:patient_app/models/pharmacy_model.dart';

class PharmacyProvider extends ChangeNotifier {
  final PharmacyService service = PharmacyService();

  // =====================
  // NEARBY PHARMACIES
  // =====================

  /// Every approved pharmacy, nearest-first. Shown in full - to cap the list
  /// later, take() from this in the screen rather than narrowing the fetch.
  List<Pharmacy> nearbyPharmacies = [];

  bool loading = false;
  String? error;

  // =====================
  // ONE PHARMACY'S SHELF
  // =====================
  List<Medicine> medicines = [];
  bool medicinesLoading = false;
  String? medicinesError;
  String medicineSearch = "";

  /// Loads pharmacies around the device's current position.
  ///
  /// [force] re-fetches even when a list is already cached, which is what the
  /// pull-to-refresh and the radius chips need.
  Future<void> fetchNearbyPharmacies({bool force = false}) async {
    if (nearbyPharmacies.isNotEmpty && !force) return;

    try {
      loading = true;
      error = null;
      notifyListeners();

      final position = await LocationHelper.getCurrentLocation();

      nearbyPharmacies = await service.getNearbyPharmacies(
        lat: position.latitude,
        lng: position.longitude,
      );
    } catch (e) {
      error = e.toString().replaceFirst("Exception: ", "");
      nearbyPharmacies = [];
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  /// Loads (and re-loads, when the user types) one pharmacy's stock.
  Future<void> fetchMedicines(String pharmacyId, {String? search}) async {
    try {
      medicinesLoading = true;
      medicinesError = null;
      medicineSearch = search ?? "";
      notifyListeners();

      medicines = await service.getPharmacyMedicines(
        pharmacyId: pharmacyId,
        search: search,
      );
    } catch (e) {
      medicinesError = e.toString().replaceFirst("Exception: ", "");
      medicines = [];
    } finally {
      medicinesLoading = false;
      notifyListeners();
    }
  }

  /// Called when leaving a pharmacy's page so the next one does not flash the
  /// previous shop's stock while it loads.
  void clearMedicines() {
    medicines = [];
    medicinesError = null;
    medicineSearch = "";
  }
}
