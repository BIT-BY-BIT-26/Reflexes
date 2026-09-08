import 'package:flutter/material.dart';
import 'package:patient_app/features/pharmacy/medicine_screen.dart';
import 'package:patient_app/features/pharmacy/pharmacy_provider.dart';
import 'package:patient_app/models/pharmacy_model.dart';
import 'package:provider/provider.dart';

class PharmacyScreen extends StatefulWidget {
  const PharmacyScreen({super.key});

  @override
  State<PharmacyScreen> createState() => _PharmacyScreenState();
}

class _PharmacyScreenState extends State<PharmacyScreen> {
  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      if (!mounted) return;

      context.read<PharmacyProvider>().fetchPharmacies();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Pharmacies",
          style: TextStyle(
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: false,
      ),

      body: Consumer<PharmacyProvider>(
        builder: (context, provider, child) {
          // =========================
          // LOADING
          // =========================

          if (provider.isLoading &&
              provider.pharmacies.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          // =========================
          // ERROR
          // =========================

          if (provider.error != null &&
              provider.pharmacies.isEmpty) {
            return _ErrorView(
              message: provider.error!,
              onRetry: () {
                provider.fetchPharmacies();
              },
            );
          }

          // =========================
          // EMPTY
          // =========================

          if (provider.pharmacies.isEmpty) {
            return RefreshIndicator(
              onRefresh: provider.refresh,
              child: ListView(
                physics:
                    const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 180),

                  Icon(
                    Icons.local_pharmacy_outlined,
                    size: 70,
                    color: Colors.grey,
                  ),

                  SizedBox(height: 16),

                  Center(
                    child: Text(
                      "No pharmacies available",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),

                  SizedBox(height: 8),

                  Center(
                    child: Text(
                      "Please check again later.",
                      style: TextStyle(
                        color: Colors.grey,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }

          // =========================
          // PHARMACY LIST
          // =========================

          return RefreshIndicator(
            onRefresh: provider.refresh,

            child: ListView.builder(
              physics:
                  const AlwaysScrollableScrollPhysics(),

              padding: const EdgeInsets.fromLTRB(
                16,
                16,
                16,
                24,
              ),

              itemCount:
                  provider.pharmacies.length,

              itemBuilder: (context, index) {
                final Pharmacy pharmacy =
                    provider.pharmacies[index];

                return PharmacyCard(
                  pharmacy: pharmacy,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            PharmacyMedicinesScreen(
                          pharmacy: pharmacy,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}


// ======================================================
// PHARMACY CARD
// ======================================================

class PharmacyCard extends StatelessWidget {
  final Pharmacy pharmacy;
  final VoidCallback onTap;

  const PharmacyCard({
    super.key,
    required this.pharmacy,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1.5,
      margin: const EdgeInsets.only(bottom: 14),

      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),

      child: InkWell(
        onTap: onTap,

        borderRadius:
            BorderRadius.circular(16),

        child: Padding(
          padding: const EdgeInsets.all(16),

          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,

            children: [

              // ==========================
              // TOP SECTION
              // ==========================

              Row(
                crossAxisAlignment:
                    CrossAxisAlignment.start,

                children: [

                  // Pharmacy icon
                  Container(
                    height: 54,
                    width: 54,

                    decoration: BoxDecoration(
                      color: Theme.of(context)
                          .colorScheme
                          .primary
                          .withOpacity(0.10),

                      borderRadius:
                          BorderRadius.circular(14),
                    ),

                    child: Icon(
                      Icons.local_pharmacy_rounded,
                      size: 30,

                      color: Theme.of(context)
                          .colorScheme
                          .primary,
                    ),
                  ),

                  const SizedBox(width: 14),

                  // Name + owner
                  Expanded(
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,

                      children: [

                        Text(
                          pharmacy.shopName,
                          maxLines: 1,
                          overflow:
                              TextOverflow.ellipsis,

                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight:
                                FontWeight.w700,
                          ),
                        ),

                        const SizedBox(height: 5),

                        if (pharmacy.ownerName
                            .isNotEmpty)
                          Text(
                            "Owner: ${pharmacy.ownerName}",
                            maxLines: 1,
                            overflow:
                                TextOverflow.ellipsis,

                            style: TextStyle(
                              fontSize: 13,
                              color:
                                  Colors.grey[600],
                            ),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 8),

                  const Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 17,
                    color: Colors.grey,
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // ==========================
              // ADDRESS
              // ==========================

              Row(
                crossAxisAlignment:
                    CrossAxisAlignment.start,

                children: [

                  const Icon(
                    Icons.location_on_outlined,
                    size: 20,
                  ),

                  const SizedBox(width: 8),

                  Expanded(
                    child: Text(
                      _getAddress(pharmacy),

                      maxLines: 2,
                      overflow:
                          TextOverflow.ellipsis,

                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // ==========================
              // PHONE
              // ==========================

              if (pharmacy.phone.isNotEmpty)
                Row(
                  children: [

                    const Icon(
                      Icons.phone_outlined,
                      size: 19,
                    ),

                    const SizedBox(width: 8),

                    Text(
                      pharmacy.phone,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),

              const SizedBox(height: 16),

              // ==========================
              // BOTTOM SECTION
              // ==========================

              Container(
                width: double.infinity,

                padding:
                    const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),

                decoration: BoxDecoration(
                  color: Theme.of(context)
                      .colorScheme
                      .primary
                      .withOpacity(0.06),

                  borderRadius:
                      BorderRadius.circular(10),
                ),

                child: Row(
                  children: [

                    Icon(
                      Icons.medication_outlined,
                      size: 19,

                      color: Theme.of(context)
                          .colorScheme
                          .primary,
                    ),

                    const SizedBox(width: 8),

                    Expanded(
                      child: Text(
                        "View available medicines",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight:
                              FontWeight.w600,

                          color: Theme.of(context)
                              .colorScheme
                              .primary,
                        ),
                      ),
                    ),

                    Icon(
                      Icons.chevron_right_rounded,
                      size: 21,

                      color: Theme.of(context)
                          .colorScheme
                          .primary,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getAddress(Pharmacy pharmacy) {
    final parts = <String>[];

    if (pharmacy.address.isNotEmpty) {
      parts.add(pharmacy.address);
    }

    if (pharmacy.city.isNotEmpty) {
      parts.add(pharmacy.city);
    }

    if (pharmacy.state.isNotEmpty) {
      parts.add(pharmacy.state);
    }

    if (pharmacy.pincode.isNotEmpty) {
      parts.add(pharmacy.pincode);
    }

    return parts.join(", ");
  }
}


// ======================================================
// ERROR VIEW
// ======================================================

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),

        child: Column(
          mainAxisAlignment:
              MainAxisAlignment.center,

          children: [

            Container(
              height: 70,
              width: 70,

              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.08),
                shape: BoxShape.circle,
              ),

              child: const Icon(
                Icons.error_outline_rounded,
                color: Colors.red,
                size: 36,
              ),
            ),

            const SizedBox(height: 18),

            const Text(
              "Something went wrong",
              textAlign: TextAlign.center,

              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              message,
              textAlign: TextAlign.center,

              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),

            const SizedBox(height: 20),

            ElevatedButton.icon(
              onPressed: onRetry,

              icon: const Icon(
                Icons.refresh_rounded,
              ),

              label: const Text("Retry"),
            ),
          ],
        ),
      ),
    );
  }
}

