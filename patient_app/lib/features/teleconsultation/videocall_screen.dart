import 'package:flutter/material.dart';
import 'package:zego_uikit_prebuilt_call/zego_uikit_prebuilt_call.dart';

class VideoCallScreen extends StatelessWidget {
  final String roomID;
  final String userID;
  final String userName;

  const VideoCallScreen({
    super.key,
    required this.roomID,
    required this.userID,
    required this.userName,
  });

  @override
  Widget build(BuildContext context) {
    return ZegoUIKitPrebuiltCall(
      appID: 1781836283,
      appSign: "c364c72a389404bca0eb9600c75c7c35dfe16fb22bd9953f8ea843bae77f6f69",

      userID: userID,
      userName: userName,

      callID: roomID,

      config: ZegoUIKitPrebuiltCallConfig.oneOnOneVideoCall(),
    );
  }
}