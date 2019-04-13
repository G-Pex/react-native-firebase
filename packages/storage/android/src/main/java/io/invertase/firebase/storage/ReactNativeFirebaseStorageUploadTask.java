package io.invertase.firebase.storage;

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import android.net.Uri;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.storage.StorageMetadata;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.UploadTask;

import java.io.File;

import javax.annotation.Nullable;

import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;

import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.buildMetadataFromMap;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.getMetadataAsMap;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.getTaskStatus;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.promiseRejectStorageException;

class ReactNativeFirebaseStorageUploadTask extends ReactNativeFirebaseStorageTask {
  private static final String TAG = "RNFBStorageUpload";
  private UploadTask uploadTask;

  ReactNativeFirebaseStorageUploadTask(int taskId, StorageReference storageReference, String appName) {
    super(taskId, storageReference, appName);
  }

  private static WritableMap getUploadTaskAsMap(@Nullable UploadTask.TaskSnapshot snapshot) {
    WritableMap map = Arguments.createMap();

    if (snapshot != null) {
      map.putDouble(KEY_TOTAL_BYTES, snapshot.getTotalByteCount());
      map.putDouble(KEY_BYTES_TRANSFERRED, snapshot.getBytesTransferred());
      map.putString(KEY_STATE, getTaskStatus(snapshot.getTask()));
      map.putMap(KEY_META_DATA, getMetadataAsMap(snapshot.getMetadata()));
    } else {
      map.putDouble(KEY_TOTAL_BYTES, 0);
      map.putDouble(KEY_BYTES_TRANSFERRED, 0);
      map.putString(KEY_STATE, getTaskStatus(null));
      map.putMap(KEY_META_DATA, Arguments.createMap());
    }

    return map;
  }

  /**
   * Create a Uri from the path, defaulting to file when there is no supplied scheme
   */
  private static Uri getUri(String uri) {
    Uri parsed = Uri.parse(uri);

    if (parsed.getScheme() == null || parsed.getScheme().isEmpty()) {
      return Uri.fromFile(new File(uri));
    }

    return parsed;
  }

  private byte[] uploadStringToByteArray(String string, String format) {
    byte[] bytes = null;
    switch (format) {
      case "base64":
        bytes = Base64.decode(string, Base64.DEFAULT);
        break;
      case "base64url":
        bytes = Base64.decode(string, Base64.URL_SAFE);
        break;
    }

    return bytes;
  }

  private void addEventListeners() {
    uploadTask.addOnProgressListener(taskSnapshotRaw -> {
      Log.d(TAG, "onProgress " + storageReference.toString());
      WritableMap taskSnapshot = getUploadTaskAsMap(taskSnapshotRaw);
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          storageReference.toString()
        ));
    });

    uploadTask.addOnCanceledListener(() -> {
      Log.d(TAG, "onCancelled " + storageReference.toString());
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          getCancelledTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          storageReference.toString()
        ));
    });

    uploadTask.addOnPausedListener(taskSnapshotRaw -> {
      Log.d(TAG, "onPaused " + storageReference.toString());
      WritableMap taskSnapshot = getUploadTaskAsMap(taskSnapshotRaw);
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          storageReference.toString()
        ));
    });
  }

  void addOnCompleteListener(Promise promise) {
    uploadTask.addOnCompleteListener(task -> {
      destroyTask();

      if (task.isSuccessful()) {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
        WritableMap taskSnapshotMap = getUploadTaskAsMap(task.getResult());

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshotMap,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          storageReference.toString()
        ));

        // re-creating WritableMap as they can only be consumed once, so another one is required
        taskSnapshotMap = getUploadTaskAsMap(task.getResult());
        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshotMap,
          ReactNativeFirebaseStorageEvent.EVENT_UPLOAD_SUCCESS,
          appName,
          storageReference.toString()
        ));

        taskSnapshotMap = getUploadTaskAsMap(task.getResult());
        promise.resolve(taskSnapshotMap);
      } else {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          getErrorTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          storageReference.toString()
        ));

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          getErrorTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_UPLOAD_FAILURE,
          appName,
          storageReference.toString()
        ));

        promiseRejectStorageException(promise, task.getException());
      }
    });
  }

  /**
   * Put String or Data from JavaScript
   */
  void begin(String string, String format, ReadableMap metadataMap) {
    StorageMetadata metadata = buildMetadataFromMap(metadataMap, null);
    uploadTask = storageReference.putBytes(uploadStringToByteArray(string, format), metadata);
    setStorageTask(uploadTask);
    addEventListeners();
  }

  /**
   * Put File from JavaScript
   */
  void begin(String localFilePath, ReadableMap metadataMap) {
    Uri fileUri = getUri(localFilePath);
    StorageMetadata metadata = buildMetadataFromMap(metadataMap, fileUri);
    uploadTask = storageReference.putFile(fileUri, metadata);
    setStorageTask(uploadTask);
    addEventListeners();
  }
}