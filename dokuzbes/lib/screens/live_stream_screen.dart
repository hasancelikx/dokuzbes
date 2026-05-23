import 'package:flutter/material.dart';

class LiveStreamScreen extends StatefulWidget {
  final int streamId;

  const LiveStreamScreen({Key? key, required this.streamId}) : super(key: key);

  @override
  State<LiveStreamScreen> createState() => _LiveStreamScreenState();
}

class _LiveStreamScreenState extends State<LiveStreamScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Stream'),
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.videocam,
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              'Stream #${widget.streamId}',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            const Text('Live streaming UI coming soon...'),
          ],
        ),
      ),
    );
  }
}
