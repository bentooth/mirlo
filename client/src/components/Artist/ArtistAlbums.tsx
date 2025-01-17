import { css } from "@emotion/css";
import React from "react";
import { useTranslation } from "react-i18next";
import ArtistTrackGroup from "./ArtistTrackGroup";
import { bp } from "../../constants";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { FaPen } from "react-icons/fa";
import { useGlobalStateContext } from "state/GlobalState";



const ArtistAlbums: React.FC<{ artist: Artist }> = ({ artist }) => {

  const {
    state: { user },
  } = useGlobalStateContext();

  const ownedByUser = artist.userId === user?.id;

  const { t } = useTranslation("translation", { keyPrefix: "artist" });

  if (!artist || artist.trackGroups.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "0rem" }}
      className={css`


        @media screen and (max-width: ${bp.medium}px) {
          border-radius: 0;
          background: var(--mi-light-background-color);
        }
        `}>
    <div
    className={css`
          padding: .5rem 2rem 0rem 2rem;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          align-items: center;

          @media screen and (max-width: ${bp.medium}px) {
            padding: .5rem .5rem 0rem;
          }
    `}
    >
    <h2>{t("releases")}</h2>
      {ownedByUser && (
        <Link to={`/manage/artists/${artist.id}`}>
          <Button compact startIcon={<FaPen />}>
            {t("edit")}
          </Button>
        </Link>
      )}
      </div>
      <div
      className={css`
            padding: 0rem 1.25rem 0rem 1.75rem;
            display: flex;
            flex-wrap: wrap;

            @media screen and (max-width: ${bp.medium}px) {
              padding: 0rem 0rem 0rem 0rem;
            }
      `}
      >
      {artist.trackGroups?.map((trackGroup) => (
        <ArtistTrackGroup key={trackGroup.id} trackGroup={trackGroup} />
      ))}
      </div>
    </div>
  );
};

export default ArtistAlbums;
