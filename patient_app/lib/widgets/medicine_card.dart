import 'package:flutter/material.dart';
import 'package:patient_app/models/medicine_model.dart';

class MedicineCard extends StatelessWidget {
  final Medicine medicine;

  const MedicineCard({
    super.key,
    required this.medicine,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(
        bottom: 12,
      ),

      child: Padding(
        padding: const EdgeInsets.all(14),

        child: Row(
          children: [

            const CircleAvatar(
              child: Icon(
                Icons.medication,
              ),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,

                children: [

                  Text(
                    medicine.medicineName,
                    style: const TextStyle(
                      fontWeight:
                          FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),

                  if (medicine.strength.isNotEmpty)
                    Text(
                      medicine.strength,
                      style: TextStyle(
                        color: Colors.grey[600],
                      ),
                    ),

                  if (medicine.manufacturer
                      .isNotEmpty)
                    Text(
                      medicine.manufacturer,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                ],
              ),
            ),

            Column(
              crossAxisAlignment:
                  CrossAxisAlignment.end,

              children: [

                Text(
                  "₹${medicine.price}",
                  style: const TextStyle(
                    fontWeight:
                        FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  "Stock: ${medicine.stock}",
                  style: const TextStyle(
                    color: Colors.green,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}