/// One medicine on a pharmacy's shelf, as returned by
/// `GET /api/pharmacy/:pharmacyId/medicines`.
///
/// The backend stores `Medicine` per BATCH, so the same drug exists several
/// times with different batch numbers. That endpoint collapses the batches per
/// medicineName+strength, which is why this holds `totalStock` (summed across
/// batches) and `nearestExpiry` (the soonest one) rather than a batch number.
class Medicine {
  final String medicineName;
  final String strength;
  final double price;
  final int totalStock;
  final DateTime? nearestExpiry;
  final String category;
  final String manufacturer;
  final String description;

  Medicine({
    required this.medicineName,
    required this.strength,
    required this.price,
    required this.totalStock,
    required this.category,
    required this.manufacturer,
    required this.description,
    this.nearestExpiry,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) {
    return Medicine(
      medicineName: json["medicineName"] ?? "",
      strength: json["strength"] ?? "",
      price: (json["price"] ?? 0).toDouble(),
      totalStock: (json["totalStock"] ?? 0) as int,
      category: json["category"] ?? "",
      manufacturer: json["manufacturer"] ?? "",
      description: json["description"] ?? "",
      nearestExpiry: json["nearestExpiry"] != null
          ? DateTime.tryParse(json["nearestExpiry"].toString())
          : null,
    );
  }

  /// The pharmacy dashboard treats a thin shelf as worth flagging.
  bool get isLowStock => totalStock > 0 && totalStock <= 10;

  String get displayName =>
      strength.isEmpty ? medicineName : "$medicineName $strength";
}
