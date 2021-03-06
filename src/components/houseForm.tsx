import { useState, useEffect, ChangeEvent, Fragment } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "@apollo/client";
import { Router, useRouter } from "next/router";
import Link from "next/link";
import { Image } from "cloudinary-react";
import { SearchBox } from "./searchBox";
import {
  CreateHouseMutation,
  CreateHouseMutationVariables,
} from "src/generated/CreateHouseMutation";
import {
  UpdateHouseMutation,
  UpdateHouseMutationVariables,
} from "src/generated/UpdateHouseMutation";
import { CreateSignatureMutation } from "src/generated/CreateSignatureMutation";

const SIGNATURE_MUTATION = gql`
  mutation CreateSignatureMutation {
    createImageSignature {
      signature
      timestamp
    }
  }
`;

const CREATE_HOUSE_MUTATION = gql`
  mutation CreateHouseMutation($input: HouseInput!) {
    createHouse(input: $input) {
      id
    }
  }
`;

const UPDATE_HOUSE_MUTATION = gql`
  mutation UpdateHouseMutation($id: String!, $input: HouseInput!) {
    updateHouse(id: $id, input: $input) {
      id
      image
      publicId
      latitude
      longitude
      bedrooms
      address
    }
  }
`;

interface IUploadImageResponse {
  secure_url: string;
}

async function uploadImage(
  image: File,
  signature: string,
  timestamp: number
): Promise<IUploadImageResponse> {
  const url = `	https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
  const formData = new FormData();
  formData.append("file", image);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_KEY ?? "");
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  return response.json();
}
interface IFormData {
  address: string;
  latitude: number;
  longitude: number;
  bedrooms: string;
  image: FileList;
}

interface IHouse {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  image: string;
  publicId: string;
}

interface IProps {
  house?: IHouse;
}

export default function HouseForm({ house }: IProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>();
  const { register, handleSubmit, setValue, errors, watch } = useForm<
    IFormData
  >({
    defaultValues: house
      ? {
          address: house.address,
          latitude: house.latitude,
          longitude: house.longitude,
          bedrooms: house.bedrooms.toString(),
        }
      : {},
  });
  const address = watch("address");

  const [createSignature] = useMutation<CreateSignatureMutation>(
    SIGNATURE_MUTATION
  );
  const [createHouse] = useMutation<
    CreateHouseMutation,
    CreateHouseMutationVariables
  >(CREATE_HOUSE_MUTATION);

  const [updateHouse] = useMutation<
    UpdateHouseMutation,
    UpdateHouseMutationVariables
  >(UPDATE_HOUSE_MUTATION);

  useEffect(() => {
    register({ name: "address" }, { required: "Please enter your address!" });
    register({ name: "latitude" }, { required: true, min: -90, max: 90 });
    register({ name: "longitude" }, { required: true, min: -180, max: 180 });
  }, [register]);

  const handleUpdate = async (current: IHouse, data: IFormData) => {
    let image = current.image;

    if (data.image[0]) {
      const { data: signatureData } = await createSignature();
      if (signatureData) {
        const { signature, timestamp } = signatureData.createImageSignature;
        const imageData = await uploadImage(
          data.image[0],
          signature,
          timestamp
        );
        image = imageData.secure_url;
      }
    }

    const { data: houseData } = await updateHouse({
      variables: {
        id: current.id,
        input: {
          address: data.address,
          image,
          coordinates: {
            latitude: data.latitude,
            longitude: data.longitude,
          },
          bedrooms: parseInt(data.bedrooms),
        },
      },
    });

    if (houseData?.updateHouse) {
      router.push(`/houses/${current.id}`);
    }
  };

  const handleCreate = async (data: IFormData) => {
    const { data: signatureData } = await createSignature();
    if (signatureData) {
      const {
        createImageSignature: { signature, timestamp },
      } = signatureData;
      const imageData = await uploadImage(data.image[0], signature, timestamp);
      const { data: houseData } = await createHouse({
        variables: {
          input: {
            address: data.address,
            image: imageData.secure_url,
            coordinates: {
              latitude: data.latitude,
              longitude: data.longitude,
            },
            bedrooms: parseInt(data.bedrooms),
          },
        },
      });

      if (houseData?.createHouse) {
        router.push(`/houses/${houseData.createHouse.id}`);
      }
    }
  };

  const onSubmit = (data: IFormData) => {
    setSubmitting(true);
    if (!!house) {
      handleUpdate(house, data);
    } else {
      handleCreate(data);
    }
  };

  return (
    <form className="mx-auto max-w-xl py-4" onSubmit={handleSubmit(onSubmit)}>
      <h1>
        {house ? `Editing ${house.address}` : "Add a New Hose"} a new House
      </h1>
      <div className="mt-4">
        <label htmlFor="search" className="block">
          Search for your address
        </label>
        <SearchBox
          defaultValue={!!house ? house.address : ""}
          onSelectAddress={(address, latitude, longitude) => {
            setValue("address", address);
            setValue("latitude", latitude);
            setValue("longitude", longitude);
          }}
        />
        {errors.address && <p>{errors.address.message}</p>}
      </div>
      {address && (
        <Fragment>
          <div className="mt-4">
            <label
              htmlFor="image"
              className="p-4 border-dashed border-4 border-gray-600 block cursor-pointer"
            >
              Click to add image (16:9)
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={register({
                validate: (fileList: FileList) => {
                  if (house || fileList.length === 1) return true;
                  return "Please upload one file!";
                },
              })}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (event?.target?.files?.[0]) {
                  const file = event.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPreviewImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {previewImage ? (
              <img
                src={previewImage}
                className="mt-4 object-cover"
                style={{ width: "576px", height: `${(9 / 16) * 576}px` }}
              />
            ) : house ? (
              <Image
                className="mt-4 object-cover"
                cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                publicId={house.publicId}
                alt={house.address}
                secure
                dpr="auto"
                quality="auto"
                width={576}
                height={Math.floor((9 / 16) * 576)}
                crop="fill"
                gravity="auto"
              />
            ) : null}
            {errors.image && <p>{errors.image.message}</p>}
          </div>
          <div className="mt-4">
            <label htmlFor="bedrooms" className="block">
              Beds
            </label>
            <input
              id="bedrooms"
              type="number"
              name="bedrooms"
              className="p-2"
              ref={register({
                required: "Please enter the number of bedrooms",
                max: { value: 10, message: "Wooahh, too big of a house" },
                min: { value: 1, message: "mist have at least 1 bedroom" },
              })}
            />
            {errors.bedrooms && <p>{errors.bedrooms.message}</p>}
          </div>
          <div className="mt-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
              type="submit"
              disabled={submitting}
            >
              Save
            </button>{" "}
            <Link href={house ? `/houses/${house.id}` : "/"}>
              <a className="ml-4">Cancel</a>
            </Link>
          </div>
        </Fragment>
      )}
    </form>
  );
}
