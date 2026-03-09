<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class TranslationService
{
    /**
     * 指定されたモデルのカラムを翻訳して translations テーブルに保存する
     */
    public function translateAndSave($model, string $column, string $text, array $locales = ['en', 'zh_CN', 'zh_TW', 'ko'])
    {
        foreach ($locales as $locale) {
            try {
                // AIへの指示（プロンプト）
                $prompt = "Translate the following Japanese text into {$locale}. " .
                            "Context: This is for an indie creator's product page on a platform called Fan-Port. " .
                            "Keep the creative and otaku-culture nuances. " .
                            "Text: {$text}";

                $result = OpenAI::chat()->create([
                    'model' => 'gpt-4o',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a professional translator specializing in Japanese subculture and indie art.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                ]);

                $translatedText = $result->choices[0]->message->content;

                // 確実にリレーション経由で保存
                $model->translations()->create([
                    'column_name' => $column,
                    'locale' => $locale,
                    'text' => $translatedText,
                ]);

                // translations テーブルへ保存 (ポリモーフィック関連を使用)
                $model->translations()->create([
                    'column_name' => $column,
                    'locale' => $locale,
                    'text' => $translatedText,
                ]);

            } catch (\Exception $e) {
                Log::error("Translation failed for {$locale}: " . $e->getMessage());
            }
        }
    }
}