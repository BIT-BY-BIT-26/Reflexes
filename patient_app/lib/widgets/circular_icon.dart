import 'package:flutter/material.dart';
class CircularIconButton extends StatelessWidget {
  final String imagePath;
  const CircularIconButton({super.key,required this.imagePath});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: ()async{
        
      },
      child: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: Colors.white, // Background color
          shape: BoxShape.circle, // Make it circular
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.6),
              spreadRadius: 2,
              blurRadius: 8,
              offset: Offset(2, 4), // changes position of shadow
            ),
          ],
        ),
        child: Image.asset(imagePath),
      ),
    );
  }
}
