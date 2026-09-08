class Medicine {
  final String id;
  final String medicineName;
  final String strength;
  final String batchNumber;
  final DateTime? manufacturingDate;
  final DateTime? expiryDate;
  final double price;
  final int stock;
  final String category;
  final String manufacturer;
  final String description;
  final String addedVia;

  Medicine({
    required this.id,
    required this.medicineName,
    required this.strength,
    required this.batchNumber,
    this.manufacturingDate,
    this.expiryDate,
    required this.price,
    required this.stock,
    required this.category,
    required this.manufacturer,
    required this.description,
    required this.addedVia,
  });

  factory Medicine.fromJson(
    Map<String, dynamic> json,
  ) {
    return Medicine(
      id: json['_id']?.toString() ?? '',

      medicineName:
          json['medicineName'] ?? '',

      strength:
          json['strength'] ?? '',

      batchNumber:
          json['batchNumber'] ?? '',

      manufacturingDate:
          json['manufacturingDate'] != null
              ? DateTime.tryParse(
                  json['manufacturingDate'].toString(),
                )
              : null,

      expiryDate:
          json['expiryDate'] != null
              ? DateTime.tryParse(
                  json['expiryDate'].toString(),
                )
              : null,

      price:
          (json['price'] as num?)?.toDouble() ?? 0.0,

      stock:
          (json['stock'] as num?)?.toInt() ?? 0,

      category:
          json['category'] ?? '',

      manufacturer:
          json['manufacturer'] ?? '',

      description:
          json['description'] ?? '',

      addedVia:
          json['addedVia'] ?? 'MANUAL',
    );
  }
}