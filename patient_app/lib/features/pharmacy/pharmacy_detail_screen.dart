import 'dart:async';

import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:patient_app/features/pharmacy/provider/pharmacy_provider.dart';
import 'package:patient_app/models/medicine_model.dart';
import 'package:patient_app/models/pharmacy_model.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

/// One pharmacy: contact details plus what it currently has in stock.
///
/// The stock list comes from `GET /api/pharmacy/:pharmacyId/medicines`, which
/// has already collapsed the per-batch `Medicine` documents into one row per
/// medicine, so quantities here are totals across batches.
class PharmacyDetailScreen extends StatefulWidget {
  final Pharmacy pharmacy;

  const PharmacyDetailScreen({super.key, required this.pharmacy});

  static Route<void> route(Pharmacy pharmacy) {
    return MaterialPageRoute(
      builder: (_) => PharmacyDetailScreen(pharmacy: pharmacy),
    );
  }

  @override
  State<PharmacyDetailScreen> createState() => _PharmacyDetailScreenState();
}

class _PharmacyDetailScreenState extends State<PharmacyDetailScreen> {
  final TextEditingController _searchController = TextEditingController();

  /// Search runs server-side, so hold off until the user stops typing.
  Timer? _debounce;

  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      if (!mounted) return;
      context.read<PharmacyProvider>().fetchMedicines(widget.pharmacy.id);
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();

    // Drop this shop's stock so the next pharmacy does not flash it.
    context.read<PharmacyProvider>().clearMedicines();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    // Keeps the clear button in sync with what has been typed.
    setState(() {});

    _debounce?.cancel();

    _debounce = Timer(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      context
          .read<PharmacyProvider>()
          .fetchMedicines(widget.pharmacy.id, search: value.trim());
    });
  }

  Future<void> _callPharmacy() async {
    final phone = widget.pharmacy.phone;
    if (phone.isEmpty) return;

    final uri = Uri(scheme: "tel", path: phone);

    if (!await launchUrl(uri)) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Could not open the dialer for $phone"),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PharmacyProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          widget.pharmacy.shopName,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.inter(color: Colors.white, fontSize: 17),
        ),
        actions: [
          if (widget.pharmacy.phone.isNotEmpty)
            IconButton(
              onPressed: _callPharmacy,
              icon: const FaIcon(
                FontAwesomeIcons.phone,
                size: 16,
                color: AppColors.accentBlue,
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          _buildHeader(),
          _buildSearchField(),
          Expanded(child: _buildMedicines(provider)),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final pharmacy = widget.pharmacy;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  pharmacy.shortAddress,
                  style: TextStyle(color: AppColors.grey, fontSize: 12),
                ),
              ),
              if (pharmacy.distanceKm != null)
                Text(
                  "${pharmacy.distanceKm!.toStringAsFixed(1)} km",
                  style: const TextStyle(
                    color: AppColors.accentBlue,
                    fontSize: 12,
                  ),
                ),
            ],
          ),
          if (pharmacy.pincode.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              "PIN ${pharmacy.pincode}",
              style: TextStyle(color: AppColors.grey, fontSize: 11),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color:
                      (pharmacy.isActive ? AppColors.success : AppColors.grey)
                          .withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  pharmacy.isActive ? "Open" : "Closed",
                  style: TextStyle(
                    fontSize: 10,
                    color: pharmacy.isActive
                        ? AppColors.success
                        : AppColors.grey,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              if (pharmacy.ownerName.isNotEmpty)
                Expanded(
                  child: Text(
                    pharmacy.ownerName,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: AppColors.grey, fontSize: 11),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: TextField(
        controller: _searchController,
        onChanged: _onSearchChanged,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          hintText: "Search medicine",
          hintStyle: TextStyle(color: AppColors.grey, fontSize: 13),
          filled: true,
          fillColor: AppColors.card,
          prefixIcon: const Icon(Icons.search, color: AppColors.grey, size: 20),
          suffixIcon: _searchController.text.isEmpty
              ? null
              : IconButton(
                  icon: const Icon(Icons.clear,
                      color: AppColors.grey, size: 18),
                  onPressed: () {
                    _searchController.clear();
                    _onSearchChanged("");
                  },
                ),
          contentPadding: const EdgeInsets.symmetric(vertical: 0),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppColors.primaryBlue),
          ),
        ),
      ),
    );
  }

  Widget _buildMedicines(PharmacyProvider provider) {
    if (provider.medicinesLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primaryBlue),
      );
    }

    if (provider.medicinesError != null) {
      return _buildEmpty(
        icon: FontAwesomeIcons.triangleExclamation,
        title: "Could not load stock",
        subtitle: provider.medicinesError!,
      );
    }

    if (provider.medicines.isEmpty) {
      return _buildEmpty(
        icon: FontAwesomeIcons.pills,
        title: provider.medicineSearch.isEmpty
            ? "Nothing in stock"
            : "No match found",
        subtitle: provider.medicineSearch.isEmpty
            ? "This pharmacy has not listed any available medicine yet."
            : "No medicine here matches \"${provider.medicineSearch}\".",
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      itemCount: provider.medicines.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        return _MedicineTile(medicine: provider.medicines[index]);
      },
    );
  }

  Widget _buildEmpty({
    required FaIconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FaIcon(icon, color: AppColors.grey, size: 36),
            const SizedBox(height: 14),
            Text(
              title,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: Colors.white, fontSize: 15),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.grey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

class _MedicineTile extends StatelessWidget {
  final Medicine medicine;

  const _MedicineTile({required this.medicine});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  medicine.displayName,
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                "₹${medicine.price.toStringAsFixed(2)}",
                style: const TextStyle(
                  color: AppColors.accentBlue,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          if (medicine.manufacturer.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              medicine.manufacturer,
              style: TextStyle(color: AppColors.grey, fontSize: 11),
            ),
          ],
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              _chip(
                medicine.isLowStock
                    ? "Only ${medicine.totalStock} left"
                    : "In stock: ${medicine.totalStock}",
                medicine.isLowStock ? AppColors.error : AppColors.success,
              ),
              if (medicine.category.isNotEmpty)
                _chip(medicine.category, AppColors.grey),
              if (medicine.nearestExpiry != null)
                _chip(
                  "Exp ${DateFormat("MMM yyyy").format(medicine.nearestExpiry!)}",
                  AppColors.grey,
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _chip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, color: color),
      ),
    );
  }
}
