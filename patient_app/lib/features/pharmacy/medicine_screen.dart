import 'package:flutter/material.dart';
import 'package:patient_app/features/pharmacy/medicine_provider.dart';
import 'package:patient_app/models/pharmacy_model.dart';
import 'package:patient_app/widgets/medicine_card.dart';
import 'package:provider/provider.dart';

class PharmacyMedicinesScreen extends StatefulWidget {
  final Pharmacy pharmacy;

  const PharmacyMedicinesScreen({
    super.key,
    required this.pharmacy,
  });

  @override
  State<PharmacyMedicinesScreen> createState() =>
      _PharmacyMedicinesScreenState();
}
class _PharmacyMedicinesScreenState
    extends State<PharmacyMedicinesScreen> {

  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      context
          .read<MedicineProvider>()
          .fetchMedicines(widget.pharmacy.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.pharmacy.shopName,
        ),
      ),

      body: Consumer<MedicineProvider>(
        builder: (context, provider, child) {

          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (provider.error != null) {
            return Center(
              child: Text(provider.error!),
            );
          }

          if (provider.medicines.isEmpty) {
            return const Center(
              child: Text(
                "No medicines available",
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),

            itemCount:
                provider.medicines.length,

            itemBuilder: (context, index) {
              final medicine =
                  provider.medicines[index];

              return MedicineCard(
                medicine: medicine,
              );
            },
          );
        },
      ),
    );
  }
}