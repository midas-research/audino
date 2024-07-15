import { useMutation } from "@tanstack/react-query";
import {
  deleteAnnotationAPi,
  postAnnotationApi,
  putAnnotationApi,
  autoAnnotationApi,
} from "../../services/job.services";
import { downloadAnnotationApi } from "../../services/annotation.services";

export const useRemoveAnnotationMutation = ({ mutationConfig }) => {
  const { ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteAnnotationAPi,

    ...restConfig,
  });
};

export const usePostAnnotationMutation = ({ mutationConfig }) => {
  const { ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: postAnnotationApi,

    ...restConfig,
  });
};

export const usePutAnnotationMutation = ({ mutationConfig }) => {
  const { ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: putAnnotationApi,
    ...restConfig,
  });
};

export const useAutoAnnotationMutation = ({ mutationConfig }) => {
  const { ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: autoAnnotationApi,
    ...restConfig,
  });
};

export const useDownloadAnnotationMutation = ({ mutationConfig }) => {
  const { ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: downloadAnnotationApi,
    ...restConfig,
  });
};
