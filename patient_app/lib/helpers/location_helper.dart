import 'package:geolocator/geolocator.dart';

class LocationHelper {
  static Future<Position> getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception("Location service disabled");
    }

    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();

      if (permission == LocationPermission.denied) {
        throw Exception("Location permission denied");
      }
    }

    if (permission == LocationPermission.deniedForever) {
      await Geolocator.openAppSettings(); // 👈 important
      throw Exception("Location permission permanently denied");
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  // static Future<Placemark> getAddressFromCoordinates(
  //   double latitude,
  //   double longitude,
  // ) async {
  //   final placemarks =
  //       await placemarkFromCoordinates(
  //     latitude,
  //     longitude,
  //   );

  //   if (placemarks.isEmpty) {
  //     throw Exception("Address not found");
  //   }

  //   return placemarks.first;
  // }
}
