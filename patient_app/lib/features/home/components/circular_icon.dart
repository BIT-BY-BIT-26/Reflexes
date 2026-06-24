import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:patient_app/utils/constants.dart';

class RoundedIcons extends StatelessWidget {
  final FaIconData iconPath;
  final double size;
  const RoundedIcons({super.key, required this.iconPath, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 45,
      width: 45,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: const Color.fromARGB(255, 21, 87, 230).withAlpha(40),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            spreadRadius: 2,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: FaIcon(iconPath, size: size, color: const Color.fromARGB(255, 21, 146, 230)),
    );
  }
}
