import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Review, ResourceResponse } from '@/types'

export interface ReviewPayload {
  rating: number
  comment?: string
}

export const reviewsApi = {
  async create(productId: number, payload: ReviewPayload): Promise<Review> {
    const { data } = await api.post<ResourceResponse<Review>>(
      `/products/${productId}/reviews`,
      payload,
    )
    return data.data
  },

  async remove(productId: number, reviewId: number): Promise<void> {
    await api.delete(`/products/${productId}/reviews/${reviewId}`)
  },
}

export function useCreateReview(productSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: number; payload: ReviewPayload }) =>
      reviewsApi.create(productId, payload),
    // Карточка товара хранит и отзывы, и денормализованный рейтинг — перезагружаем её.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product', productSlug] }),
  })
}
