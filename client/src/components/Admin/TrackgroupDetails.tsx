import Button from "components/common/Button";
import FormComponent from "components/common/FormComponent";
import { InputEl } from "components/common/Input";
import LoadingSpinner from "components/common/LoadingSpinner";
import { SelectEl } from "components/common/Select";
import TextArea from "components/common/TextArea";
import { useSnackbar } from "state/SnackbarContext";
import React from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import api from "services/api";
import { useTranslation } from "react-i18next";
// import {
//   AdminTrackGroup,
//   fetchTrackGroup,
//   updateTrackGroup,
// } from "services/api/Admin";

interface TrackGroupFormData {
  coverFile: File[];
  title: string;
  published: boolean;
  enabled: boolean;
  id: number;
  type: "lp" | "ep" | "album" | "single";
  releaseDate: string;
  about: string;
  artistId: number;
  cover: { id: number; url: string };
}

export const TrackGroupDetails: React.FC = () => {
  const { trackgroupId } = useParams();
  const snackbar = useSnackbar();
  const { register, handleSubmit, reset } = useForm<TrackGroupFormData>();
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useTranslation("translation", {
    keyPrefix: "trackGroupDetails",
  });

  const [trackgroup, setTrackgroup] = React.useState<TrackGroup>();

  const fetchTrackWrapper = React.useCallback(
    async (id: string) => {
      const { result } = await api.get<TrackGroup>(`trackGroups/${id}`);
      setTrackgroup(result);
      reset({
        ...result,
      });
    },
    [reset]
  );

  React.useEffect(() => {
    if (trackgroupId) {
      fetchTrackWrapper(trackgroupId);
    }
  }, [fetchTrackWrapper, trackgroupId]);

  const doSave = React.useCallback(
    async (data: TrackGroupFormData) => {
      if (trackgroupId) {
        try {
          setIsLoading(true);
          await api.put<TrackGroupFormData, TrackGroup>(
            `trackGroups/${trackgroupId}`,
            data
          );
          if (data.coverFile[0] && typeof data.coverFile[0] !== "string") {
            await api.uploadFile(
              `trackGroups/${trackgroupId}/cover`,
              data.coverFile
            );
          }
          snackbar("Successfully updated track group", { type: "success" });
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [trackgroupId, snackbar]
  );

  return (
    <>
      <h3>
        {t("trackgroup")} {trackgroup?.title}
      </h3>
      <form onSubmit={handleSubmit(doSave)}>
        <FormComponent>
          {t("title")} <InputEl {...register("title")} />
        </FormComponent>
        <FormComponent>
          {t("type")}
          <SelectEl defaultValue="lp" {...register("type")}>
            <option value="lp">LP</option>
            <option value="ep">EP</option>
          </SelectEl>
        </FormComponent>
        <FormComponent>
          {t("releaseDate")}{" "}
          <InputEl type="date" {...register("releaseDate")} />
        </FormComponent>
        <FormComponent>
          {t("about")} <TextArea {...register("about")} />
        </FormComponent>
        <FormComponent style={{ display: "flex" }}>
          <input type="checkbox" id="private" {...register("published")} />
          <label htmlFor="private">
            {t("isPrivate")}
            <small>{t("privateAlbumDescription")}</small>
          </label>
        </FormComponent>
        <FormComponent style={{ display: "flex" }}>
          <input type="checkbox" id="enabled" {...register("enabled")} />
          <label htmlFor="enabled">
            {t("isEnabled")}
            <small>{t("enabledAlbumDescription")}</small>
          </label>
        </FormComponent>

        <Button
          type="submit"
          style={{ marginTop: "1rem" }}
          disabled={isLoading}
          isLoading={isLoading}
        >
          {t("saveTrackGroupButton")}
        </Button>
      </form>
    </>
  );
};

export default TrackGroupDetails;
