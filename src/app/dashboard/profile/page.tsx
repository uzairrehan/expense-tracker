"use client";

import Sidebar from "@/components/sidebar";
import { app } from "@/firebase/firebaseconfig";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import Image from 'next/image'


export default function Profile() {
   const [file, setFile] = useState<File>();
   const [errorMsg, setErrorMsg] = useState("");
   const [progress, setProgress] = useState<null | number>(null);
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [imageURL, setImageURL] = useState("")

   const storage = getStorage(app);

   const uploadImage = async () => {
      if (!file) {
         setErrorMsg("first select an image.");
         return;
      }
      setErrorMsg("");
      console.log(file);

      const imageRef = ref(storage, `random/${Date.now}`);
      try {
         const uploadTask = uploadBytesResumable(imageRef, file);

         uploadTask.on('state_changed',
            (snapshot) => {

               const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
               console.log('Upload is ' + progress + '% done');
               setProgress(progress)

            },
            (error) => {
               console.log(error);
            },
            () => {

               getDownloadURL(uploadTask.snapshot.ref)
                  .then((downloadURL) => {
                     console.log('File available at', downloadURL);
                     setImageURL(downloadURL);
                  })
                  .catch((e) => {
                     console.log(e);
                  })
            }
         );

      } catch (e) {
         console.log(e);
      }


   }
   return (
      <>
      <Sidebar/>
         <input type="file"
            onChange={(e) => {
               const files = e.target.files;
               if (files) setFile(files[0]);
            }}
         />

         <button onClick={uploadImage}>Upload Image</button>
         {imageURL ? <Image src={imageURL} alt="picture" width={200} height={200}/> : null} 

         {progress && <p>Upload is {progress} % done</p>}
         {errorMsg && <p>{errorMsg}</p>}

      </>
   )
}