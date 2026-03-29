type Variant = {
  value: string
  options: string[]
}

type SKU = {
  value: string
  price: number
  stock: number
  image: string
}

type Data = {
  product: {
    publishedAt: string | null // ISO date string
    name: string
    basePrice: number
    virtualPrice: number
    brandId: number
    images: string[]
    variants: Variant[]
    categories: number[]
  }
  skus: SKU[]
}

function generateSKUs(variants: Variant[]): SKU[] {
  // Hàm hỗ trợ để tạo tất cả tổ hợp
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), [''])
  }

  // Lấy mảng các options từ variants
  const options = variants.map((variant) => variant.options)

  // Tạo tất cả tổ hợp
  const combinations = getCombinations(options)

  // Chuyển tổ hợp thành SKU objects
  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: '',
  }))
}

// Ví dụ sử dụng
const variants: Variant[] = [
  {
    value: 'Màu sắc',
    options: ['Đen', 'Trắng', 'Đỏ'],
  },
  {
    value: 'Size',
    options: ['S', 'M', 'L'],
  },
]

// Test hàm
const skus = generateSKUs(variants)
console.log(JSON.stringify(skus))
