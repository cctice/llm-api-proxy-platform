export const successResponse = (data: any, message?: string) => ({
  success: true,
  data,
  ...(message && { message }),
});

export const paginatedResponse = (
  data: any[],
  page: number,
  pageSize: number,
  total: number
) => ({
  success: true,
  data,
  pagination: {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  },
});
