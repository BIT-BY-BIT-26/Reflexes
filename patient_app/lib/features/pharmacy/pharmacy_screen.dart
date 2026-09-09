import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:patient_app/features/pharmacy/pharmacy_detail_screen.dart';
import 'package:patient_app/features/pharmacy/provider/pharmacy_provider.dart';
import 'package:patient_app/models/pharmacy_model.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:provider/provider.dart';

/// Nearby pharmacies, sorted by distance.
///
/// Backed by `GET /api/pharmacy/nearby`, which only returns pharmacies a
/// hospital admin has APPROVED - a freshly signed-up shop stays PENDING and
/// will not show up here.
class PharmacyScreen extends StatefulWidget {
  const PharmacyScreen({super.key});

  static Route<void> route() {
    return MaterialPageRoute(builder: (_) => const PharmacyScreen());
  }

  @override
  State<PharmacyScreen> createState() => _PharmacyScreenState();
}

class _PharmacyScreenState extends State<PharmacyScreen> {
  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      if (!mounted) return;
      context.read<PharmacyProvider>().fetchNearbyPharmacies();
    });
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
          "Nearest Pharmacies",
          style: GoogleFonts.inter(color: Colors.white, fontSize: 18),
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.primaryBlue,
        backgroundColor: AppColors.card,
        onRefresh: () => provider.fetchNearbyPharmacies(force: true),
        child: _buildBody(provider),
      ),
    );
  }

  Widget _buildBody(PharmacyProvider provider) {
    if (provider.loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primaryBlue),
      );
    }

    if (provider.error != null) {
      return _buildMessage(
        icon: FontAwesomeIcons.locationCrosshairs,
        title: "Could not find pharmacies",
        subtitle: provider.error!,
        actionLabel: "Try again",
        onAction: () => provider.fetchNearbyPharmacies(force: true),
      );
    }

    if (provider.nearbyPharmacies.isEmpty) {
      return _buildMessage(
        icon: FontAwesomeIcons.pills,
        title: "No pharmacies found",
        subtitle:
            "No approved pharmacy has registered yet. Pull down to refresh.",
        actionLabel: "Refresh",
        onAction: () => provider.fetchNearbyPharmacies(force: true),
      );
    }

    final pharmacies = provider.nearbyPharmacies;

    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
      itemCount: pharmacies.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        return _PharmacyCard(pharmacy: pharmacies[index]);
      },
    );
  }

  /// Empty / error state. Wrapped in a scroll view so pull-to-refresh still
  /// works when there is no list to drag on.
  Widget _buildMessage({
    required FaIconData icon,
    required String title,
    required String subtitle,
    required String actionLabel,
    required VoidCallback onAction,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    FaIcon(icon, color: AppColors.grey, size: 40),
                    const SizedBox(height: 16),
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      subtitle,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.grey, fontSize: 12),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBlue,
                      ),
                      onPressed: onAction,
                      child: Text(
                        actionLabel,
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _PharmacyCard extends StatelessWidget {
  final Pharmacy pharmacy;

  const _PharmacyCard({required this.pharmacy});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () {
        Navigator.push(context, PharmacyDetailScreen.route(pharmacy));
      },
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.primaryBlue.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(
                child: FaIcon(
                  FontAwesomeIcons.prescriptionBottleMedical,
                  color: AppColors.accentBlue,
                  size: 18,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    pharmacy.shopName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    pharmacy.shortAddress,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: AppColors.grey, fontSize: 11),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (pharmacy.distanceKm != null) ...[
                        const FaIcon(
                          FontAwesomeIcons.locationDot,
                          size: 10,
                          color: AppColors.grey,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          "${pharmacy.distanceKm!.toStringAsFixed(1)} km away",
                          style: TextStyle(
                            color: AppColors.grey,
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(width: 12),
                      ],
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: (pharmacy.isActive
                                  ? AppColors.success
                                  : AppColors.grey)
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
                    ],
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: AppColors.grey,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
