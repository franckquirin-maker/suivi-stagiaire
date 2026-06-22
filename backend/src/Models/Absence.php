<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class Absence extends Model
{
    protected string $table = 'absence';
    protected string $primaryKey = 'id_evenement';
}
