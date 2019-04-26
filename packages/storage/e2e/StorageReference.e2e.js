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

describe('storage() -> StorageReference', () => {
  describe('toString()', () => {
    it('returns the correct bucket path to the file', () => {
      const app = firebase.app();
      firebase
        .storage()
        .ref('/uploadNope.jpeg')
        .toString()
        .should.equal(`gs://${app.options.storageBucket}/uploadNope.jpeg`);
    });
  });

  describe('properties', () => {
    describe('fullPath', () => {
      it('returns the full path as a string', () => {
        firebase
          .storage()
          .ref('/foo/uploadNope.jpeg')
          .fullPath.should.equal(`foo/uploadNope.jpeg`);
        firebase
          .storage()
          .ref('foo/uploadNope.jpeg')
          .fullPath.should.equal(`foo/uploadNope.jpeg`);
      });
    });

    describe('storage', () => {
      it('returns the instance of storage', () => {
        firebase
          .storage()
          .ref('/foo/uploadNope.jpeg')
          .storage.ref.should.be.a.Function();
      });
    });

    describe('bucket', () => {
      it('returns the storage bucket as a string', () => {
        const app = firebase.app();
        firebase
          .storage()
          .ref('/foo/uploadNope.jpeg')
          .bucket.should.equal(app.options.storageBucket);
      });
    });

    describe('name', () => {
      it('returns the file name as a string', () => {
        const ref = firebase.storage().ref('/foo/uploadNope.jpeg');
        ref.name.should.equal('uploadNope.jpeg');
      });
    });

    describe('parent', () => {
      it('returns the parent directory as a reference', () => {
        firebase
          .storage()
          .ref('/foo/uploadNope.jpeg')
          .parent.fullPath.should.equal('foo');
      });

      it('returns null if already at root', () => {
        const ref = firebase.storage().ref('/');
        should.equal(ref.parent, null);
      });
    });

    describe('root', () => {
      it('returns a reference to the root of the bucket', () => {
        firebase
          .storage()
          .ref('/foo/uploadNope.jpeg')
          .root.fullPath.should.equal('/');
      });
    });
  });

  describe('child()', () => {
    it('returns a reference to a child path', () => {
      const parentRef = firebase.storage().ref('/foo');
      const childRef = parentRef.child('someFile.json');
      childRef.fullPath.should.equal('foo/someFile.json');
    });
  });

  describe('delete()', () => {
    before(async () => {
      await firebase
        .storage()
        .ref('/ok.jpeg')
        .getFile(`${firebase.storage.Path.DocumentDirectory}/deleteMe.jpeg`);
      await firebase
        .storage()
        .ref('/deleteMe.jpeg')
        .putFile(`${firebase.storage.Path.DocumentDirectory}/deleteMe.jpeg`);
    });

    it('should delete a file', async () => {
      const storageReference = firebase.storage().ref('/deleteMe.jpeg');
      await storageReference.delete();

      try {
        await storageReference.getMetadata();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/object-not-found');
        error.message.should.equal(
          '[storage/object-not-found] No object exists at the desired reference.',
        );
        return Promise.resolve();
      }
    });

    it('throws error if file does not exist', async () => {
      const storageReference = firebase.storage().ref('/iDoNotExist.jpeg');

      try {
        await storageReference.delete();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/object-not-found');
        error.message.should.equal(
          '[storage/object-not-found] No object exists at the desired reference.',
        );
        return Promise.resolve();
      }
    });

    it('throws error if no write permission', async () => {
      const storageReference = firebase.storage().ref('/uploadNope.jpeg');

      try {
        await storageReference.delete();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/unauthorized');
        error.message.should.equal(
          '[storage/unauthorized] User is not authorized to perform the desired action.',
        );
        return Promise.resolve();
      }
    });
  });

  describe('getDownloadURL', () => {
    it('should return a download url for a file', async () => {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      const downloadUrl = await storageReference.getDownloadURL();
      downloadUrl.should.be.a.String();
      downloadUrl.should.containEql('/ok.jpeg');
      downloadUrl.should.containEql(firebase.app().options.projectId);
    });

    it('throws error if file does not exist', async () => {
      const storageReference = firebase.storage().ref('/iDoNotExist.jpeg');

      try {
        await storageReference.getDownloadURL();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/object-not-found');
        error.message.should.equal(
          '[storage/object-not-found] No object exists at the desired reference.',
        );
        return Promise.resolve();
      }
    });

    it('throws error if no write permission', async () => {
      const storageReference = firebase.storage().ref('/writeOnly.jpeg');

      try {
        await storageReference.getDownloadURL();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/unauthorized');
        error.message.should.equal(
          '[storage/unauthorized] User is not authorized to perform the desired action.',
        );
        return Promise.resolve();
      }
    });
  });

  describe('getMetadata', () => {
    it('should return a metadata for a file', async () => {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      const metadata = await storageReference.getMetadata();
      metadata.generation.should.be.a.String(); // TODO change ios
      metadata.fullPath.should.equal('ok.jpeg');
      metadata.name.should.equal('ok.jpeg');
      metadata.size.should.be.a.Number();
      should.equal(metadata.size > 0, true);
      metadata.updated.should.be.a.String(); // TODO change ios & android
      should.equal(metadata.updated > 0, true);
      metadata.timeCreated.should.be.a.String(); // TODO change ios & android
      should.equal(metadata.timeCreated > 0, true);
      metadata.contentEncoding.should.be.a.String();
      metadata.contentDisposition.should.be.a.String();
      metadata.contentType.should.equal('image/jpeg');
      metadata.bucket.should.equal(`${firebase.app().options.projectId}.appspot.com`);
      metadata.metageneration.should.be.a.String(); // TODO change ios
      metadata.md5hash.should.be.a.String();
      metadata.cacheControl.should.be.a.String();
      metadata.contentLanguage.should.be.a.String();
      metadata.customMetadata.should.be.a.Object();
    });
  });

  describe('updateMetadata', () => {
    it('should return the updated metadata for a file', async () => {
      const storageReference = firebase.storage().ref('/writeOnly.jpeg');
      const metadata = await storageReference.updateMetadata({
        contentType: 'image/jpeg',
        customMetadata: {
          hello: 'world',
        },
      });

      metadata.customMetadata.hello.should.equal('world');
      metadata.generation.should.be.a.String();
      metadata.fullPath.should.equal('writeOnly.jpeg');
      metadata.name.should.equal('writeOnly.jpeg');
      metadata.size.should.be.a.Number();
      should.equal(metadata.size > 0, true);
      metadata.updated.should.be.a.Number();
      should.equal(metadata.updated > 0, true);
      metadata.timeCreated.should.be.a.Number();
      should.equal(metadata.timeCreated > 0, true);
      metadata.contentEncoding.should.be.a.String();
      metadata.contentDisposition.should.be.a.String();
      metadata.contentType.should.equal('image/jpeg');
      metadata.bucket.should.equal(`${firebase.app().options.projectId}.appspot.com`);
      metadata.metageneration.should.be.a.String();
      metadata.md5hash.should.be.a.String();
      metadata.cacheControl.should.be.a.String();
      metadata.contentLanguage.should.be.a.String();
      metadata.customMetadata.should.be.a.Object();
    });

    it('should remove customMetadata properties by setting the value to null', async () => {
      const storageReference = firebase.storage().ref('/writeOnly.jpeg');
      const metadata = await storageReference.updateMetadata({
        contentType: 'image/jpeg',
        customMetadata: {
          removeMe: 'please',
        },
      });

      metadata.customMetadata.removeMe.should.equal('please');

      const metadataAfterRemove = await storageReference.updateMetadata({
        contentType: 'image/jpeg',
        customMetadata: {
          removeMe: null,
        },
      });

      should.equal(metadataAfterRemove.customMetadata.removeMe, undefined);
    });
  });
});
