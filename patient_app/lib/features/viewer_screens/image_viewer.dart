import 'package:flutter/material.dart';

class ImageViewerScreen extends StatelessWidget {
  final String imageUrl;
  const ImageViewerScreen({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Center(
        child: InteractiveViewer(
          child: Image.network(imageUrl),
        ),
      ),
    );
  }
}
