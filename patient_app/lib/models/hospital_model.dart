import 'package:patient_app/models/review_model.dart';

class Hospital {
  final String id;
  final String name;
  final String email;
  final String hospitalLicense;
  final String phoneNumber;
  final String city;
  final String state;
  final int pincode;
  final String description;
  final String address;
  final String logo;
  final String coverImage;
  final double? distanceKm;
  final bool? isActive;
  final List<String> facilities;
  final List<String> galleryImages;
  final double averageRating;
  final int totalReviews;
  // final Map<String, int> ratingDistribution;
  // final List<ReviewModel> reviews;
  

  Hospital( {
    required this.id,
    required this.name,
    required this.email,
    required this.hospitalLicense,
    required this.phoneNumber,
    required this.city,
    required this.state,
    required this.pincode,
    required this.description,
    required this.address,
    required this.logo,
    required this.totalReviews,
    required this.averageRating,
    this.isActive,
    required this.galleryImages,
    required this.coverImage,
    required this.facilities,
    this.distanceKm,
  });

  factory Hospital.fromJson(Map<String, dynamic> json) {
    return Hospital(
      id: json["_id"] ?? "",
      name: json["name"] ?? "",
      email: json["email"] ?? "",
      hospitalLicense: json["hospitalLicense"] ?? "",
      phoneNumber: json["phone_number"] ?? "",
      city: json["city"] ?? "",
      state: json["state"] ?? "",
      pincode: json["pincode"] ?? 0,
      description: json["description"] ?? "",
      address: json["address"] ?? "",
      logo: json["logo"] ?? "",
      coverImage: json["coverImage"] ?? "",
      isActive: json['isActive'],
      distanceKm: json['distanceKm'] != null
          ? (json['distanceKm'] as num).toDouble()
          : null,
      galleryImages: List<String>.from(json["galleryImages"] ?? []),
      facilities: List<String>.from(json["facilities"] ?? []),
      averageRating: (json["averageRating"] ?? 0).toDouble(),
      totalReviews: json["totalReviews"] ?? 0,

    );
  }
}
