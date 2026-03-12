<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\Region;
use Illuminate\Database\Seeder;

class CountryRegionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['code' => 'JP', 'name' => 'Japan', 'regions' => ['Tokyo', 'Osaka', 'Aichi', 'Fukuoka', 'Hokkaido', 'Kyoto']],
            ['code' => 'US', 'name' => 'United States', 'regions' => ['California', 'Texas', 'New York', 'Florida', 'Washington']],
            ['code' => 'KR', 'name' => 'South Korea', 'regions' => ['Seoul', 'Busan', 'Incheon', 'Gyeonggi-do']],
            ['code' => 'TW', 'name' => 'Taiwan', 'regions' => ['Taipei', 'Kaohsiung', 'Taichung', 'New Taipei']],
            ['code' => 'ID', 'name' => 'Indonesia', 'regions' => ['Jakarta', 'West Java', 'East Java', 'Bali']],
            ['code' => 'TH', 'name' => 'Thailand', 'regions' => ['Bangkok', 'Chiang Mai', 'Phuket', 'Chon Buri']],
            ['code' => 'FR', 'name' => 'France', 'regions' => ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur']],
        ];

        foreach ($data as $item) {
            $country = Country::create([
                'code' => $item['code'],
                'name' => $item['name'],
            ]);

            foreach ($item['regions'] as $regionName) {
                Region::create([
                    'country_id' => $country->id,
                    'name' => $regionName,
                ]);
            }
        }
    }
}