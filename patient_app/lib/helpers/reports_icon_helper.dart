import 'package:flutter/material.dart';

IconData getReportIcon(String type) {
  switch (type) {
    case "LAB":
      return Icons.science; // 🧪 lab test
    case "XRAY":
      return Icons.medical_information; //  x-ray feel
    case "MRI":
      return Icons.monitor_heart; // ❤️ scan type
    case "OTHER":
    default:
      return Icons.description; // 📄 generic document
  }
}
