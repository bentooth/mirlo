import { css } from "@emotion/css";
import { InputEl } from "components/common/Input";
import LoadingSpinner from "components/common/LoadingSpinner";
import React from "react";
import { useFormContext } from "react-hook-form";

const UploadImage: React.FC<{
  formName: string;
  existingCover?: string;
  updatedAt?: string;
  isLoading?: boolean;
}> = ({ formName, existingCover, isLoading, updatedAt }) => {
  const [existingImage, setExistingImage] = React.useState(existingCover);
  const { watch, register } = useFormContext();
  const image = watch(formName);
  React.useEffect(() => {
    setExistingImage(`${existingCover}?updateAt=${updatedAt}`);
  }, [existingCover, updatedAt]);

  return (
    <>
      <div
        className={css`
          position: relative;
        `}
      >
        {existingCover && (image?.length === 0 || image === undefined) && (
          <img src={existingImage} alt="album cover" />
        )}
        {image?.length > 0 && (
          <img
            src={URL.createObjectURL(image[0])}
            className={css`
              max-width: 120px;
            `}
            alt="album cover"
          />
        )}
        {isLoading && (
          <LoadingSpinner
            className={css`
              top: 50%;
              position: absolute;
              right: 0;
              left: 0;
              width: 100%;
              margin-top: -1rem;
              font-size: 2rem;
            `}
          />
        )}
      </div>
      <InputEl
        type="file"
        id="image"
        {...register("coverFile")}
        accept="image/*"
      />
    </>
  );
};

export default UploadImage;
